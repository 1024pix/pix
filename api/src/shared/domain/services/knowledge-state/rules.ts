/**
 * The rules that read and move a user's knowledge state on one tube.
 *
 * Inference only propagates within a tube: a right answer validates the
 * asked level and everything below it, a wrong answer invalidates the asked
 * level and everything above it.
 * Two bounds are therefore enough: every level at or under the floor is validated,
 * every level at or above the ceiling is invalidated,
 * the levels strictly in between are untested.
 *
 * These functions are pure: they never mutate the knowledge state they receive.
 */
import { type KnowledgeElementStatus } from '../../models/KnowledgeElement.js';
import { KnowledgeState } from '../../models/KnowledgeState.ts';

export const isValidated = (knowledgeState: KnowledgeState, level: number): boolean => level <= knowledgeState.floor;

export const isInvalidated = (knowledgeState: KnowledgeState, level: number): boolean =>
  knowledgeState.ceiling !== null && level >= knowledgeState.ceiling;

export const isAssessed = (knowledgeState: KnowledgeState, level: number): boolean =>
  isValidated(knowledgeState, level) || isInvalidated(knowledgeState, level);

export const isDirect = (knowledgeState: KnowledgeState, level: number): boolean =>
  knowledgeState.directLevels.includes(level);

/** The status the knowledge state gives the level, or null for an untested level. */
export const statusOf = (knowledgeState: KnowledgeState, level: number): KnowledgeElementStatus | null => {
  if (isValidated(knowledgeState, level)) {
    return 'validated';
  }
  return isInvalidated(knowledgeState, level) ? 'invalidated' : null;
};

type Answer = {
  level: number;
  isOk: boolean;
  at?: Date;
};

/**
 * Update a knowledge state with a new answer, returning a new state.
 * A failure dates the ceiling; a success leaves the ceiling and its date alone.
 */
export const update = (knowledgeState: KnowledgeState, { level, isOk, at = new Date() }: Answer): KnowledgeState => {
  if (isAssessed(knowledgeState, level)) {
    return knowledgeState;
  }

  return new KnowledgeState({
    userId: knowledgeState.userId,
    tubeId: knowledgeState.tubeId,
    floor: isOk ? level : knowledgeState.floor,
    ceiling: isOk ? knowledgeState.ceiling : level,
    ceilingAt: isOk ? knowledgeState.ceilingAt : at,
    directLevels: [...knowledgeState.directLevels, level],
    updatedAt: at,
  });
};
