/**
 * Reads and saves knowledge elements for the users whose knowledge is stored
 * as knowledge states.
 *
 * The knowledge element repository sends here the users found in the
 * migration table. Their knowledge elements are built from their knowledge
 * states on read, and update them on save. The saved ones are also kept as
 * rows, in the migrated user knowledge elements table, for the data lake only.
 */
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';
import { type KnowledgeState } from '../../domain/models/KnowledgeState.ts';
import { type Skill } from '../../domain/models/Skill.js';
import { UserCompetenceScore } from '../../domain/models/UserCompetenceScore.ts';
import { buildKnowledgeElementsFromKnowledgeStates } from '../../domain/services/knowledge-state/build-knowledge-elements-from-knowledge-states.ts';
import {
  applyStoredScores,
  computePixByCompetenceId,
  updateCompetenceScores,
} from '../../domain/services/knowledge-state/competence-scores.ts';
import { keepOneSkillPerLevel } from '../../domain/services/knowledge-state/skills.ts';
import {
  type KnowledgeStatesUpdate,
  updateKnowledgeStatesWithKnowledgeElements,
} from '../../domain/services/knowledge-state/update-knowledge-states-with-knowledge-elements.ts';
import * as knowledgeStateRepository from './knowledge-state-repository.ts';
import * as migratedUserKnowledgeElementRepository from './migrated-user-knowledge-element-repository.ts';
import * as skillRepository from './skill-repository.js';
import * as userCompetenceScoreRepository from './user-competence-score-repository.ts';

const toPixByCompetenceId = (userCompetenceScores: UserCompetenceScore[]) =>
  new Map(userCompetenceScores.map(({ competenceId, pix }) => [competenceId, pix]));

const skillsToBuildFrom = (skills: Skill[], skillIds: string[]): Skill[] => {
  const requestedSkillIds = new Set(skillIds);
  return skillIds.length > 0 ? skills.filter(({ id }) => requestedSkillIds.has(id)) : keepOneSkillPerLevel(skills);
};

const buildForUser = (
  userKnowledgeStates: KnowledgeState[],
  userCompetenceScores: UserCompetenceScore[],
  skills: Skill[],
  skillsToBuild: Skill[],
  limitDate?: Date | string,
): KnowledgeElement[] => {
  const knowledgeStatesAtDate = limitDate
    ? userKnowledgeStates.filter(({ updatedAt }) => updatedAt < new Date(limitDate))
    : userKnowledgeStates;

  return applyStoredScores(
    buildKnowledgeElementsFromKnowledgeStates({ knowledgeStates: knowledgeStatesAtDate, skills: skillsToBuild }),
    computePixByCompetenceId(userKnowledgeStates, skills),
    toPixByCompetenceId(userCompetenceScores),
  );
};

/**
 * Gives the knowledge elements of the user, built from their knowledge states.
 *
 *   - `skillIds`: only these skills get a knowledge element. Without it, each
 *     assessed level gets one, on a single version of its skill.
 *   - `limitDate`: only the tubes that did not move since this date are
 *     given. A knowledge state has no history: a tube that moved after the
 *     date cannot be given as it was before.
 */
export const findUniqByUserId = async (
  userId: number,
  skillIds: string[] = [],
  limitDate?: Date | string,
): Promise<KnowledgeElement[]> => {
  const [skills, knowledgeStates, userCompetenceScores] = await Promise.all([
    skillRepository.list(),
    knowledgeStateRepository.findByUserId(userId),
    userCompetenceScoreRepository.findByUserId(userId),
  ]);

  return buildForUser(knowledgeStates, userCompetenceScores, skills, skillsToBuildFrom(skills, skillIds), limitDate);
};

/**
 * Gives the knowledge elements of each given user, as findUniqByUserId does,
 * in one read of the knowledge states and one of the scores.
 */
export const findUniqByUserIds = async (
  userIds: number[],
  skillIds: string[] = [],
  limitDate?: Date | string,
): Promise<Map<number, KnowledgeElement[]>> => {
  if (userIds.length === 0) return new Map();

  const [skills, knowledgeStates, userCompetenceScores] = await Promise.all([
    skillRepository.list(),
    knowledgeStateRepository.findByUserIds(userIds),
    userCompetenceScoreRepository.findByUserIds(userIds),
  ]);

  const skillsToBuild = skillsToBuildFrom(skills, skillIds);
  const knowledgeStatesByUserId = Map.groupBy(knowledgeStates, ({ userId }) => userId);
  const userCompetenceScoresByUserId = Map.groupBy(userCompetenceScores, ({ userId }) => userId);

  return new Map(
    userIds.map((userId) => [
      userId,
      buildForUser(
        knowledgeStatesByUserId.get(userId) ?? [],
        userCompetenceScoresByUserId.get(userId) ?? [],
        skills,
        skillsToBuild,
        limitDate,
      ),
    ]),
  );
};

// A reset knowledge element carries the date of the one it resets: the save dates every move.
const withoutDate = (knowledgeElements: KnowledgeElement[]): KnowledgeElement[] =>
  knowledgeElements.map((knowledgeElement) => new KnowledgeElement({ ...knowledgeElement, createdAt: undefined }));

const resetSkillIdsOf = (knowledgeElements: KnowledgeElement[]): Set<string> =>
  new Set(knowledgeElements.filter(({ status }) => status === 'reset').map(({ skillId }) => skillId));

const competenceIdsOf = (skills: Skill[], isKept: (skill: Skill) => boolean): string[] => [
  ...new Set(skills.filter(isKept).map(({ competenceId }) => competenceId)),
];

/** The scores of the user once their knowledge states moved. */
const scoresAfterUpdate = (
  userId: number,
  userCompetenceScores: UserCompetenceScore[],
  knowledgeStatesBefore: KnowledgeState[],
  update: KnowledgeStatesUpdate,
  resetSkillIds: Set<string>,
  skills: Skill[],
  at: Date,
): UserCompetenceScore[] => {
  const impactedTubeIds = new Set([...update.knowledgeStates.map(({ tubeId }) => tubeId), ...update.forgottenTubeIds]);
  const knowledgeStatesAfter = [
    ...knowledgeStatesBefore.filter(({ tubeId }) => !impactedTubeIds.has(tubeId)),
    ...update.knowledgeStates,
  ];
  const pixByCompetenceId = updateCompetenceScores(
    toPixByCompetenceId(userCompetenceScores),
    knowledgeStatesBefore,
    knowledgeStatesAfter,
    competenceIdsOf(skills, ({ tubeId }) => impactedTubeIds.has(tubeId)),
    competenceIdsOf(skills, ({ id }) => resetSkillIds.has(id)),
    skills,
  );

  return [...pixByCompetenceId].map(
    ([competenceId, pix]) => new UserCompetenceScore({ userId, competenceId, pix, updatedAt: at }),
  );
};

const saveForUser = async (
  userId: number,
  knowledgeElements: KnowledgeElement[],
  skills: Skill[],
  at: Date,
): Promise<KnowledgeElement[]> => {
  await knowledgeStateRepository.lockUser(userId);
  const knowledgeStatesBefore = await knowledgeStateRepository.findByUserId(userId);
  const userCompetenceScores = await userCompetenceScoreRepository.findByUserId(userId);

  const update = updateKnowledgeStatesWithKnowledgeElements({
    userId,
    knowledgeStates: knowledgeStatesBefore,
    knowledgeElements: withoutDate(knowledgeElements),
    skills,
    at,
  });
  const userCompetenceScoresAfter = scoresAfterUpdate(
    userId,
    userCompetenceScores,
    knowledgeStatesBefore,
    update,
    resetSkillIdsOf(knowledgeElements),
    skills,
    at,
  );

  await knowledgeStateRepository.upsert(update.knowledgeStates);
  await knowledgeStateRepository.remove(userId, update.forgottenTubeIds);
  await userCompetenceScoreRepository.upsert(userCompetenceScoresAfter);

  return migratedUserKnowledgeElementRepository.batchSave(knowledgeElements, at);
};

/**
 * Updates the knowledge states of a user with the given knowledge elements,
 * those of one answer or one reset, and moves their competence scores
 * accordingly: a score only goes down when its competence is reset. The
 * knowledge elements are kept as rows for the data lake, and given back with
 * their id, dated from the save.
 */
export const batchSave = async (
  knowledgeElements: KnowledgeElement[],
  at = new Date(),
): Promise<KnowledgeElement[]> => {
  if (knowledgeElements.length === 0) return [];

  const skills = await skillRepository.list();
  const { userId } = knowledgeElements[0];

  return DomainTransaction.execute(() => saveForUser(userId, knowledgeElements, skills, at));
};
