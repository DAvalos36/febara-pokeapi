# Pokeapi Fabara

Aplicación web para armar equipos Pokémon y analizar sus debilidades de tipo,
con un asistente de IA que consulta tus datos reales antes de responder.

Prueba técnica full-stack. Incluye autenticación, integración con la PokéAPI,
persistencia y los tres bonus opcionales (LLM, MCP y análisis inteligente).

![Constructor de equipos con el análisis de cobertura de tipos](https://i.ibb.co/SwB6NjBP/brave-screenshot-localhost.png)

## La idea

La app resuelve el problema que un entrenador tiene de
verdad: **elegir seis**.

Cada Pokémon tiene uno o dos de 18 tipos, y entre ellos hay ventajas tipo
piedra-papel-tijera. Un equipo puede parecer fuerte y tener un agujero enorme:
si tres de tus seis caen ante Eléctrico, un solo rival te barre. La app calcula
esa cobertura en tiempo real mientras armas el equipo.

## Puesta en marcha

Requiere **Node 20+**.

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev
```

Aunque yo utilicé pnpm como gestor de dependencias, es 100% posible utilizar el
nativo npm:

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Abre <http://localhost:3000>, crea una cuenta y empieza por **Equipos**.

Variables de entorno:

| Variable | Obligatoria | Para qué |
|---|---|---|
| `DATABASE_URL` | sí | Ruta del archivo SQLite. El valor por defecto sirve. |
| `AUTH_SECRET` | sí | Firma las sesiones y los tokens MCP. Usa una cadena larga y aleatoria. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | solo para el chat | Key gratuita de [Google AI Studio](https://aistudio.google.com), sin tarjeta. |

Sin la key de Google todo funciona menos el asistente, que responde 503 con un
mensaje explicando qué falta.

## Qué hace

![Pantalla de registro](https://i.ibb.co/DcZB2Kh/brave-screenshot-localhost-1.png)

**Pokédex** (`/pokemon`) — Buscador con paginación sobre la PokéAPI. Las
respuestas se cachean 24 h con `revalidate`, así que navegar no repite
peticiones.

**Equipos** (`/equipos/[id]`) — La pantalla principal. Seis huecos, un buscador
de Pokédex debajo y, en medio, la cobertura de los 18 tipos:

- **rojo** — dos o más miembros reciben daño doble
- **ámbar** — solo uno es débil
- **verde** — alguien resiste o es inmune

Debajo, el resumen en texto: *"Debilidad compartida: Eléctrico (3), Tierra (2)"*
y *"Sin respuesta ofensiva contra: Acero, Hada"*. La tabla de efectividad viaja
al navegador una vez, así que mover un Pokémon repinta el análisis sin ir al
servidor.

**Asistente** (`/chat`) — Chat que responde sobre tus equipos usando
herramientas. Bajo cada respuesta aparece qué herramientas consultó, para que se
vea que los datos son reales y no inventados.

**Conexión MCP** (`/mcp`) — Genera tu token y el comando para conectar Claude
Code, Claude Desktop o Cursor.

## Arquitectura

Next.js 16 con App Router hace de frontend y backend. No hay servidor aparte: los
Route Handlers son la API.

```
lib/tools.ts          ← las cinco funciones de negocio, definidas una vez
   ├── app/api/chat   ← transporte HTTP para el chat de la app
   └── app/api/mcp    ← transporte MCP para clientes externos
```

Esa es la decisión de diseño central: **una capa de lógica, dos transportes**.
`lib/tools.ts` no sabe nada de modelos ni de protocolos; recibe un `userId` y
devuelve datos. Añadir una herramienta la hace aparecer en el chat y en el MCP a
la vez.

El resto de `lib/` sigue la misma idea:

| Archivo | Responsabilidad |
|---|---|
| `coverage.ts` | Cálculo de multiplicadores y huecos. Funciones puras, sin I/O. |
| `pokeapi.ts` | Cliente de la PokéAPI con caché. |
| `session.ts` | JWT de sesión (compatible con el runtime Edge). |
| `password.ts` | Hash con bcrypt. |
| `mcp-token.ts` | Tokens de acceso para clientes MCP. |
| `db.ts` | Cliente de Prisma. |

### Modelo de datos

```
User ─< Team ─< TeamMember
```

`TeamMember` guarda el `pokemonId` y el nombre; todo lo demás (sprites, tipos,
estadísticas) se resuelve contra la PokéAPI y se cachea. La base de datos guarda
solo lo que es tuyo.

### Autenticación

Sesión con un JWT firmado (`jose`), contraseñas con bcrypt
a coste 12, y `proxy.ts` protegiendo las rutas privadas. Se eligió `jose` sobre
`node:crypto` porque el proxy corre en el runtime Edge, donde `node:crypto` no
está disponible.

## Bonus implementados

### Asistente con herramientas

`/api/chat` usa el AI SDK de Vercel con **Gemini 2.5 Flash**, hasta seis rondas
de llamadas a herramientas por pregunta. El modelo tiene prohibido inventar
datos: para cualquier dato consulta una herramienta.

Cinco herramientas: `buscarPokemon`, `verPokemon`, `listarEquipos`,
`analizarEquipo` y `agregarAEquipo` — la última modifica datos, así que el
asistente puede armar equipos por ti.

Cada una recibe el `userId` como primer parámetro, que sale de la sesión y nunca
de la conversación. El modelo no puede acceder a equipos ajenos aunque se lo
pidan.

El proveedor se cambia en una línea: `google("gemini-2.5-flash")` por
`anthropic("claude-sonnet-5")`, sin tocar la lógica.

### Servidor MCP

`/api/mcp` expone las mismas cinco herramientas por Model Context Protocol,
usando `mcp-handler`. Cualquier cliente compatible puede consultar y modificar
tus equipos.

Para conectarlo, entra en `/mcp`, copia el comando y pégalo en tu terminal con
la app corriendo:

```bash
claude mcp add --transport http pokedex http://localhost:3000/api/mcp \
  --header "Authorization: Bearer <tu-token>"
```

La autenticación es por bearer token (`withMcpAuth`), y el `userId` sale del
token firmado. Sin token, el endpoint responde 401 con la cabecera
`WWW-Authenticate` que marca el estándar.

![Servidor MCP conectado y autenticado en Claude Code](https://i.ibb.co/gbrgJnTv/Captura-de-pantalla-2026-09-21-a-la-s-5-16-04-p-m.png)

Una vez conectado, el asistente analiza los equipos desde fuera de la app:

![Claude Code analizando un equipo con las herramientas del servidor](https://i.ibb.co/XZ1BhjYd/Captura-de-pantalla-2026-09-21-a-la-s-5-15-44-p-m.png)

### Análisis inteligente

`analizarEquipo` no le pide al modelo que razone sobre tipos: el cálculo lo hace
`lib/coverage.ts` de forma determinista y el modelo recibe el resultado ya
digerido. La IA explica y recomienda; las matemáticas son código.

## Decisiones técnicas

**Next.js** por ser un framework full-stack: cubre frontend y backend en un solo
proyecto y cumple de sobra los requisitos de la aplicación.

**SQLite** sobre otro gestor de base de datos para facilitarle el arranque a
quien revise la prueba: no hay que levantar ningún servicio. Para el alcance de
esta prueba es suficiente.

**bcrypt** como buena práctica para mantener las contraseñas seguras y
hasheadas, nunca en texto plano.

**El AI SDK de Vercel** en lugar de los SDK propios de cada proveedor, para
tener una integración simple en caso de querer cambiar de LLM. Además se integra
excelente con Next.js, al ser del mismo proveedor.

**HeroUI** como biblioteca de componentes, por ser moderna y visualmente
agradable.

**Gemini** fue elegido únicamente por su free tier.
