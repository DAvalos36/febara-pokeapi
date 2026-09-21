export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Pokeapi Febara",
  description: "Gestiona tu colección de Pokémon y arma equipos equilibrados.",
  navItems: [
    { label: "Pokédex", href: "/pokemon" },
    { label: "Equipos", href: "/equipos" },
    { label: "Asistente", href: "/chat" },
    { label: "MCP", href: "/mcp" },
  ],
};
