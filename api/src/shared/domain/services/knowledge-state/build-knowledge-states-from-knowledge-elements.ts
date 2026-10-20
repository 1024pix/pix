/**
 * Builds a user's knowledge states from their knowledge elements, one per tube.
 */

import { KnowledgeElement, type KnowledgeElementStatus } from '../../models/KnowledgeElement.js';
import { KnowledgeState } from '../../models/KnowledgeState.ts';
import { type Skill } from '../../models/Skill.js';
import { UnknownSkillsError } from './errors.ts';

type KnowledgeElementWithSkill = { knowledgeElement: KnowledgeElement; skill: Skill };

const buildKnowledgeStateOfTube = (
  userId: number,
  tubeId: string,
  knowledgeElementsWithSkill: KnowledgeElementWithSkill[],
): KnowledgeState => {
  const levelsWithStatus = (status: KnowledgeElementStatus) =>
    knowledgeElementsWithSkill
      .filter(({ knowledgeElement }) => knowledgeElement.status === status)
      .map(({ skill }) => skill.difficulty);

  const floor = Math.max(0, ...levelsWithStatus('validated'));
  // Historical knowledge can be inconsistent: a level may be marked as failed even though a higher level has been validated.
  // Validation takes priority, so only failures above the floor are considered.
  // Otherwise, the knowledge state would prevent selecting levels above the floor.

  const invalidatedLevelsAboveFloor = levelsWithStatus('invalidated').filter((level) => level > floor);

  const ceiling = invalidatedLevelsAboveFloor.length > 0 ? Math.min(...invalidatedLevelsAboveFloor) : null;

  const latestDate = (dated: KnowledgeElementWithSkill[]): Date =>
    new Date(Math.max(...dated.map(({ knowledgeElement }) => new Date(knowledgeElement.createdAt as Date).getTime())));

  // The ceiling is dated by the latest failure above the floor, whatever its level: a tube
  // keeps one date for its failures, and a fresh failure must not be hidden by an older
  // one at the ceiling level, or improving would assess it again at once.
  const ceilingAt =
    ceiling === null
      ? null
      : latestDate(
          knowledgeElementsWithSkill.filter(
            ({ knowledgeElement, skill }) => knowledgeElement.status === 'invalidated' && skill.difficulty > floor,
          ),
        );

  // A failed level under the floor is now validated by inference: a higher
  // direct success contradicted the direct answer, so the level is no longer direct.
  // Several skills of a tube can share a level (versions), so a level is kept once.
  const addDirectLevel = (levels: number[], { knowledgeElement, skill }: KnowledgeElementWithSkill): number[] => {
    const isAnsweredDirectly = knowledgeElement.source === 'direct';
    const isContradictedByFloor = knowledgeElement.status === 'invalidated' && skill.difficulty <= floor;
    return isAnsweredDirectly && !isContradictedByFloor && !levels.includes(skill.difficulty)
      ? [...levels, skill.difficulty]
      : levels;
  };
  const directLevels = knowledgeElementsWithSkill.reduce(addDirectLevel, []);

  const updatedAt = latestDate(knowledgeElementsWithSkill);

  return new KnowledgeState({ userId, tubeId, floor, ceiling, ceilingAt, directLevels, updatedAt });
};

/**
 * Keeps, for each skill, the most recent knowledge element that is not a
 * reset, as today's readers do, then describes each of their tubes by its
 * bounds. A tube whose knowledge was entirely reset has no knowledge state.
 *
 * Throws when a knowledge element points to a skill the learning content does
 * not know: that is broken data, and the caller decides what to do with it.
 */
export const buildKnowledgeStatesFromKnowledgeElements = ({
  userId,
  knowledgeElements,
  skills,
}: {
  userId: number;
  knowledgeElements: KnowledgeElement[];
  skills: Skill[];
}): KnowledgeState[] => {
  const skillById = new Map(skills.map((skill) => [skill.id, skill]));
  const latestUniqNonResetKnowledgeElements = KnowledgeElement.toLatestUniqNonResetCollection(knowledgeElements);

  // A knowledge element gets its date from the database: one without a date
  // was never saved, and the caller must date it first.
  if (latestUniqNonResetKnowledgeElements.some(({ createdAt }) => !createdAt)) {
    throw new Error('Knowledge elements without createdAt cannot build knowledge states');
  }

  const addUnknownSkillId = (skillIds: string[], { skillId }: KnowledgeElement): string[] =>
    skillById.has(skillId) || skillIds.includes(skillId) ? skillIds : [...skillIds, skillId];
  const unknownSkillIds = latestUniqNonResetKnowledgeElements.reduce(addUnknownSkillId, []);

  if (unknownSkillIds.length > 0) {
    throw new UnknownSkillsError(unknownSkillIds);
  }

  const byTube = new Map<string, KnowledgeElementWithSkill[]>();

  for (const knowledgeElement of latestUniqNonResetKnowledgeElements) {
    const skill = skillById.get(knowledgeElement.skillId) as Skill;
    const knowledgeElementsWithSkill = byTube.get(skill.tubeId) ?? [];
    knowledgeElementsWithSkill.push({ knowledgeElement, skill });
    byTube.set(skill.tubeId, knowledgeElementsWithSkill);
  }

  return [...byTube.entries()].map(([tubeId, knowledgeElementsWithSkill]) =>
    buildKnowledgeStateOfTube(userId, tubeId, knowledgeElementsWithSkill),
  );
};
