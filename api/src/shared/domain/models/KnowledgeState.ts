/**
 * A user's knowledge state on one tube.
 *
 *   floor        : difficulty of the highest validated skill   (0 if none)
 *   ceiling      : difficulty of the lowest invalidated skill  (null if none)
 *   ceilingAt    : date of the latest failure above the floor  (null without ceiling)
 *   directLevels : difficulties actually asked, as opposed to inferred ones
 *   updatedAt    : last move of the tube
 *
 * A validated level stays validated, so the tube keeps one date for its
 * successes, its last move, and one for its failures: improving a competence
 * or a campaign assesses again a failure old enough, and needs its own date,
 * which a later success on the tube would otherwise hide. One date for all
 * the failures of the tube means the latest one shields the older ones: a
 * failure is kept as long as the tube has a recent failure.
 */
export type KnowledgeStateType = {
  userId: number;
  tubeId: string;
  floor?: number;
  ceiling?: number | null;
  ceilingAt?: Date | null;
  directLevels?: number[];
  updatedAt?: Date;
};

const sortedUniqueLevels = (tubeId: string, levels: number[]): number[] => {
  if (new Set(levels).size !== levels.length) {
    throw new Error(`Knowledge state of tube ${tubeId} has duplicate direct levels: ${levels.join(', ')}`);
  }
  return levels.toSorted((a, b) => a - b);
};

/** The date of the ceiling: none without ceiling, the last move when not given. */
const ceilingAtOf = (
  tubeId: string,
  ceiling: number | null,
  ceilingAt: Date | null | undefined,
  updatedAt: Date,
): Date | null => {
  if (ceiling === null) {
    if (ceilingAt) {
      throw new Error(`Knowledge state of tube ${tubeId} has a ceiling date without ceiling`);
    }
    return null;
  }
  return ceilingAt ?? updatedAt;
};

export class KnowledgeState {
  userId: number;
  tubeId: string;
  floor: number;
  ceiling: number | null;
  ceilingAt: Date | null;
  directLevels: number[];
  updatedAt: Date;

  constructor({
    userId,
    tubeId,
    floor = 0,
    ceiling = null,
    ceilingAt,
    directLevels = [],
    updatedAt = new Date(),
  }: KnowledgeStateType) {
    this.userId = userId;
    this.tubeId = tubeId;
    this.floor = floor;
    this.ceiling = ceiling;
    this.ceilingAt = ceilingAtOf(tubeId, ceiling, ceilingAt, updatedAt);
    this.directLevels = sortedUniqueLevels(tubeId, directLevels);
    this.updatedAt = updatedAt;
  }
}
