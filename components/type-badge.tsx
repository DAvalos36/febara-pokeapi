const TYPE_COLORS: Record<string, string> = {
  normal: "bg-stone-400/20 text-stone-700 dark:text-stone-300",
  fire: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  water: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  electric: "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300",
  grass: "bg-green-500/20 text-green-700 dark:text-green-300",
  ice: "bg-cyan-400/20 text-cyan-700 dark:text-cyan-300",
  fighting: "bg-red-600/20 text-red-700 dark:text-red-300",
  poison: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  ground: "bg-amber-600/20 text-amber-700 dark:text-amber-300",
  flying: "bg-indigo-400/20 text-indigo-700 dark:text-indigo-300",
  psychic: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
  bug: "bg-lime-500/20 text-lime-700 dark:text-lime-300",
  rock: "bg-yellow-700/20 text-yellow-800 dark:text-yellow-300",
  ghost: "bg-violet-600/20 text-violet-700 dark:text-violet-300",
  dragon: "bg-indigo-600/20 text-indigo-700 dark:text-indigo-300",
  dark: "bg-neutral-700/20 text-neutral-700 dark:text-neutral-300",
  steel: "bg-slate-400/20 text-slate-700 dark:text-slate-300",
  fairy: "bg-rose-400/20 text-rose-700 dark:text-rose-300",
};

export const TYPE_LABELS: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  electric: "Eléctrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
};

export function TypeBadge({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[type] ?? "bg-default/20"} ${className ?? ""}`}
    >
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}
