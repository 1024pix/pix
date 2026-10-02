/**
 * A user's knowledge state on one tube.
 *
 * This is the target model of knowledge, meant to replace knowledge elements.
 * One instance mirrors one row of the `knowledge-states` table:
 *
 *   floor        : difficulty of the highest validated skill   (0 if none)
 *   ceiling      : difficulty of the lowest invalidated skill  (null if none)
 *   directLevels : difficulties actually asked, as opposed to inferred ones
 *   updatedAt    : last move of the tube
 *
 * These bounds are enough because inference only propagates within the tube:
 * downwards when the answer is right, upwards when it is wrong. Every skill
 * with difficulty <= floor is therefore validated, every skill with
 * difficulty >= ceiling is invalidated, and the strictly intermediate zone is
 * the uncertainty the selection algorithm tries to reduce.
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
  updatedAt: Date | undefined;

  constructor({ userId, tubeId, floor = 0, ceiling = null, directLevels = [], updatedAt }: KnowledgeStateType) {
    this.userId = userId;
    this.tubeId = tubeId;
    this.floor = floor;
    this.ceiling = ceiling;
    this.directLevels = directLevels;
    this.updatedAt = updatedAt;
  }
}
