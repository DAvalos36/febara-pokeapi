export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Pokeapi Fabara",
  description: "Gestiona tu colección de Pokémon y arma equipos equilibrados.",
  navItems: [
    { label: "Pokédex", href: "/pokemon" },
    { label: "Equipos", href: "/equipos" },
  ],
};
