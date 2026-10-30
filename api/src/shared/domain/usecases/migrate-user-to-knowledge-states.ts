import type * as KnowledgeStateMigrationRepository from '../../infrastructure/repositories/knowledge-state-migration-repository.ts';
import type * as KnowledgeStateRepository from '../../infrastructure/repositories/knowledge-state-repository.ts';
import type * as UserCompetenceScoreRepository from '../../infrastructure/repositories/user-competence-score-repository.ts';
import { DomainTransaction } from '../DomainTransaction.js';
import { type KnowledgeElement } from '../models/KnowledgeElement.js';
import { type Skill } from '../models/Skill.js';
import { UserCompetenceScore } from '../models/UserCompetenceScore.ts';
import { buildKnowledgeStatesFromKnowledgeElements } from '../services/knowledge-state/build-knowledge-states-from-knowledge-elements.ts';
import { withinBound } from '../services/knowledge-state/competence-scores.ts';

export type KnowledgeStateMigrationReport = {
  knowledgeElementCount: number;
  knowledgeStateCount: number;
  unknownSkillIds: string[];
};

type DatedKnowledgeElement = KnowledgeElement & { createdAt: Date };

/**
 * Moves the knowledge of a user from knowledge elements to knowledge states.
 *
 * The knowledge states of the user are built from their latest knowledge
 * elements, the pix score they earned is stored per competence, and the user
 * is added to the migration table: from then on, the knowledge element
 * repository reads and saves their knowledge through the knowledge states.
 *
 * The knowledge elements are left untouched: removing the user from the
 * migration table brings them back as they were at the time of the migration.
 *
 * Gives the report stored with the migration, or null when the user was
 * already migrated.
 */
export const migrateUserToKnowledgeStates = ({
  userId,
  knowledgeElementRepository,
  knowledgeStateRepository,
  knowledgeStateMigrationRepository,
  skillRepository,
  userCompetenceScoreRepository,
}: {
  userId: number;
  knowledgeElementRepository: { findUniqByUserId: (params: { userId: number }) => Promise<DatedKnowledgeElement[]> };
  knowledgeStateRepository: Pick<typeof KnowledgeStateRepository, 'lockUser' | 'upsert'>;
  knowledgeStateMigrationRepository: Pick<typeof KnowledgeStateMigrationRepository, 'isMigrated' | 'save'>;
  skillRepository: { list: () => Promise<Skill[]> };
  userCompetenceScoreRepository: Pick<typeof UserCompetenceScoreRepository, 'upsert'>;
}): Promise<KnowledgeStateMigrationReport | null> =>
  DomainTransaction.execute(async () => {
    // An answer of the user saved meanwhile waits for the migration to end,
    // and goes to the knowledge states.
    await knowledgeStateRepository.lockUser(userId);
    if (await knowledgeStateMigrationRepository.isMigrated(userId)) {
      return null;
    }

    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });
    const skills = await skillRepository.list();
    const knownSkillIds = new Set(skills.map(({ id }) => id));

    const knowledgeStates = buildKnowledgeStatesFromKnowledgeElements({
      userId,
      knowledgeElements: knowledgeElements.filter(({ skillId }) => knownSkillIds.has(skillId)),
      skills,
    });

    // The score keeps every pix the user earned, even on skills the learning
    // content no longer knows: the score must not move with the migration.
    const knowledgeElementsByCompetenceId = Map.groupBy(
      knowledgeElements.filter(({ competenceId }) => Boolean(competenceId)),
      ({ competenceId }) => competenceId,
    );
    const userCompetenceScores = [...knowledgeElementsByCompetenceId].map(
      ([competenceId, competenceKnowledgeElements]) =>
        new UserCompetenceScore({
          userId,
          competenceId,
          pix: withinBound(competenceKnowledgeElements.reduce((pix, { earnedPix }) => pix + earnedPix, 0)),
        }),
    );

    const report = {
      knowledgeElementCount: knowledgeElements.length,
      knowledgeStateCount: knowledgeStates.length,
      unknownSkillIds: [
        ...new Set(knowledgeElements.map(({ skillId }) => skillId).filter((skillId) => !knownSkillIds.has(skillId))),
      ],
    };

    await knowledgeStateRepository.upsert(knowledgeStates);
    await userCompetenceScoreRepository.upsert(userCompetenceScores);
    await knowledgeStateMigrationRepository.save(userId, report);

    return report;
  });
