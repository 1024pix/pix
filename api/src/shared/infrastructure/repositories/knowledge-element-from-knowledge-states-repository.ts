/**
 * Reads and saves knowledge elements for the users whose knowledge is stored
 * as knowledge states.
 *
 * The knowledge element repository sends here the users found in the
 * migration table. Their knowledge elements are not rows: they are built
 * from their knowledge states on read, and update them on save.
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
import { updateKnowledgeStatesWithKnowledgeElements } from '../../domain/services/knowledge-state/update-knowledge-states-with-knowledge-elements.ts';
import * as knowledgeStateRepository from './knowledge-state-repository.ts';
import * as skillRepository from './skill-repository.js';
import * as userCompetenceScoreRepository from './user-competence-score-repository.ts';

const toPixByCompetenceId = (userCompetenceScores: UserCompetenceScore[]) =>
  new Map(userCompetenceScores.map(({ competenceId, pix }) => [competenceId, pix]));

/**
 * Gives the knowledge elements of each given user, built from their
 * knowledge states.
 *
 *   - `skillIds`: only these skills get a knowledge element. Without it, each
 *     assessed level gets one, on a single version of its skill.
 *   - `limitDate`: only the tubes that did not move since this date are
 *     given. A knowledge state has no history: a tube that moved after the
 *     date cannot be given as it was before.
 */
export const findUniqByUserIds = async ({
  userIds,
  skillIds = [],
  limitDate,
}: {
  userIds: number[];
  skillIds?: string[];
  limitDate?: Date | string;
}): Promise<Map<number, KnowledgeElement[]>> => {
  if (userIds.length === 0) return new Map();

  const skills = await skillRepository.list();
  const knowledgeStates = await knowledgeStateRepository.findByUserIds({ userIds });
  const userCompetenceScores = await userCompetenceScoreRepository.findByUserIds(userIds);

  const requestedSkillIds = new Set(skillIds);
  const skillsToBuild =
    skillIds.length > 0 ? skills.filter(({ id }) => requestedSkillIds.has(id)) : keepOneSkillPerLevel(skills);
  const knowledgeStatesByUserId = Map.groupBy(knowledgeStates, ({ userId }) => userId);
  const userCompetenceScoresByUserId = Map.groupBy(userCompetenceScores, ({ userId }) => userId);

  return new Map(
    userIds.map((userId) => {
      const userKnowledgeStates = knowledgeStatesByUserId.get(userId) ?? [];
      const knowledgeStatesAtDate = limitDate
        ? userKnowledgeStates.filter(({ updatedAt }) => updatedAt < new Date(limitDate))
        : userKnowledgeStates;

      const knowledgeElements = applyStoredScores(
        buildKnowledgeElementsFromKnowledgeStates({ knowledgeStates: knowledgeStatesAtDate, skills: skillsToBuild }),
        computePixByCompetenceId(userKnowledgeStates, skills),
        toPixByCompetenceId(userCompetenceScoresByUserId.get(userId) ?? []),
      );

      return [userId, knowledgeElements];
    }),
  );
};

const saveForUser = async ({
  userId,
  knowledgeElements,
  skills,
  at,
}: {
  userId: number;
  knowledgeElements: KnowledgeElement[];
  skills: Skill[];
  at: Date;
}) => {
  const knowledgeStatesBefore = await knowledgeStateRepository.findByUserIds({ userIds: [userId] });
  const userCompetenceScores = await userCompetenceScoreRepository.findByUserIds([userId]);

  const { knowledgeStates: changedKnowledgeStates, forgottenTubeIds } = updateKnowledgeStatesWithKnowledgeElements({
    userId,
    knowledgeStates: knowledgeStatesBefore,
    // A reset knowledge element carries the date of the one it resets: the save dates every move.
    knowledgeElements: knowledgeElements.map(
      (knowledgeElement) => new KnowledgeElement({ ...knowledgeElement, createdAt: undefined }),
    ),
    skills,
    at,
  });

  const impactedTubeIds = new Set([...changedKnowledgeStates.map(({ tubeId }) => tubeId), ...forgottenTubeIds]);
  const knowledgeStatesAfter: KnowledgeState[] = [
    ...knowledgeStatesBefore.filter(({ tubeId }) => !impactedTubeIds.has(tubeId)),
    ...changedKnowledgeStates,
  ];
  const impactedCompetenceIds = [
    ...new Set(skills.filter(({ tubeId }) => impactedTubeIds.has(tubeId)).map(({ competenceId }) => competenceId)),
  ];
  const resetSkillIds = new Set(
    knowledgeElements.filter(({ status }) => status === 'reset').map(({ skillId }) => skillId),
  );
  const resetCompetenceIds = [
    ...new Set(skills.filter(({ id }) => resetSkillIds.has(id)).map(({ competenceId }) => competenceId)),
  ];
  const pixByCompetenceId = updateCompetenceScores(
    toPixByCompetenceId(userCompetenceScores),
    knowledgeStatesBefore,
    knowledgeStatesAfter,
    impactedCompetenceIds,
    resetCompetenceIds,
    skills,
  );

  await knowledgeStateRepository.save({ knowledgeStates: changedKnowledgeStates });
  await knowledgeStateRepository.remove({ userId, tubeIds: forgottenTubeIds });
  await userCompetenceScoreRepository.save(
    [...pixByCompetenceId].map(
      ([competenceId, pix]) => new UserCompetenceScore({ userId, competenceId, pix, updatedAt: at }),
    ),
  );
};

/**
 * Updates the knowledge states of the users with the given knowledge
 * elements, and moves their competence scores accordingly: a score only goes
 * down when its competence is reset. No knowledge element row is inserted:
 * those returned carry the date of the save and no id.
 */
export const batchSave = async ({
  knowledgeElements,
  at = new Date(),
}: {
  knowledgeElements: KnowledgeElement[];
  at?: Date;
}): Promise<KnowledgeElement[]> => {
  if (knowledgeElements.length === 0) return [];

  const skills = await skillRepository.list();
  const knowledgeElementsByUserId = Map.groupBy(knowledgeElements, ({ userId }) => userId);

  await DomainTransaction.execute(async () => {
    for (const [userId, userKnowledgeElements] of knowledgeElementsByUserId) {
      await saveForUser({ userId, knowledgeElements: userKnowledgeElements, skills, at });
    }
  });

  return knowledgeElements.map(
    (knowledgeElement) => new KnowledgeElement({ ...knowledgeElement, id: undefined, createdAt: at }),
  );
};
