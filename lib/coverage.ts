import type { TypeChart } from "./pokeapi";

export type TeamMemberTypes = { name: string; types: string[] };

export type TypeCoverage = {
  type: string;
  weakMembers: string[];
  resistantMembers: string[];
  immuneMembers: string[];
  offensiveMembers: string[];
};

export function damageMultiplier(
  chart: TypeChart,
  attacking: string,
  defendingTypes: string[],
): number {
  return defendingTypes.reduce((total, defending) => {
    const value = chart[attacking]?.[defending];

    return total * (value ?? 1);
  }, 1);
}

export function teamCoverage(
  chart: TypeChart,
  team: TeamMemberTypes[],
): TypeCoverage[] {
  return Object.keys(chart).map((attacking) => {
    const coverage: TypeCoverage = {
      type: attacking,
      weakMembers: [],
      resistantMembers: [],
      immuneMembers: [],
      offensiveMembers: [],
    };

    for (const member of team) {
      const incoming = damageMultiplier(chart, attacking, member.types);

      if (incoming === 0) coverage.immuneMembers.push(member.name);
      else if (incoming > 1) coverage.weakMembers.push(member.name);
      else if (incoming < 1) coverage.resistantMembers.push(member.name);

      const outgoing = member.types.some(
        (memberType) => damageMultiplier(chart, memberType, [attacking]) > 1,
      );

      if (outgoing) coverage.offensiveMembers.push(member.name);
    }

    return coverage;
  });
}

export function coverageGaps(coverage: TypeCoverage[]) {
  return {
    sharedWeaknesses: coverage
      .filter((entry) => entry.weakMembers.length >= 2)
      .sort((a, b) => b.weakMembers.length - a.weakMembers.length),
    uncoveredOffense: coverage.filter(
      (entry) => entry.offensiveMembers.length === 0,
    ),
  };
}
