export interface DivisionInfo {
  id: number;
  name: string;
}

export interface DivisionGroup<T> {
  key: string;
  name: string | null;
  drivers: T[];
}

// Split standings (already sorted) into one group per division, keeping the
// division order. Drivers without a division go in a trailing group. Leagues
// without divisions get a single unnamed group.
export function groupByDivision<T extends { division_id?: number | null }>(
  drivers: T[],
  divisions: DivisionInfo[]
): DivisionGroup<T>[] {
  if (divisions.length === 0) {
    return [{ key: 'all', name: null, drivers }];
  }

  const divisionIds = new Set(divisions.map(d => d.id));
  const groups: DivisionGroup<T>[] = divisions.map(division => ({
    key: `division-${division.id}`,
    name: division.name,
    drivers: drivers.filter(d => d.division_id === division.id)
  }));

  const unassigned = drivers.filter(d => d.division_id == null || !divisionIds.has(d.division_id));
  if (unassigned.length > 0) {
    groups.push({ key: 'unassigned', name: 'No division', drivers: unassigned });
  }

  return groups;
}
