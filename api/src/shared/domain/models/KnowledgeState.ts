/**
 * A user's knowledge state on one tube.
 *
 *   floor        : difficulty of the highest validated skill   (0 if none)
 *   ceiling      : difficulty of the lowest invalidated skill  (null if none)
 *   directLevels : difficulties actually asked, as opposed to inferred ones
 *   updatedAt    : last move of the tube
 */
export type KnowledgeStateType = {
  userId: number;
  tubeId: string;
  floor?: number;
  ceiling?: number | null;
  directLevels?: number[];
  updatedAt?: Date;
};

export class KnowledgeState {
  userId: number;
  tubeId: string;
  floor: number;
  ceiling: number | null;
  directLevels: number[];
  updatedAt: Date;

  constructor({
    userId,
    tubeId,
    floor = 0,
    ceiling = null,
    directLevels = [],
    updatedAt = new Date(),
  }: KnowledgeStateType) {
    this.userId = userId;
    this.tubeId = tubeId;
    this.floor = floor;
    this.ceiling = ceiling;
    this.directLevels = directLevels;
    this.updatedAt = updatedAt;
  }
}
