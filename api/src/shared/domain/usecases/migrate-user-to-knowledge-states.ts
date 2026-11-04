import type * as KnowledgeStateMigrationRepository from '../../infrastructure/repositories/knowledge-state-migration-repository.ts';
import type * as KnowledgeStateRepository from '../../infrastructure/repositories/knowledge-state-repository.ts';
import type * as UserCompetenceScoreRepository from '../../infrastructure/repositories/user-competence-score-repository.ts';
import { logger as defaultLogger } from '../../infrastructure/utils/logger.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { type KnowledgeElement } from '../models/KnowledgeElement.js';
import { type Skill } from '../models/Skill.js';
import { translateKnowledgeElements } from '../services/knowledge-state/translate-knowledge-elements.ts';

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
  logger = defaultLogger,
}: {
  userId: number;
  knowledgeElementRepository: { findUniqByUserId: (params: { userId: number }) => Promise<DatedKnowledgeElement[]> };
  knowledgeStateRepository: Pick<typeof KnowledgeStateRepository, 'lockUser' | 'upsert'>;
  knowledgeStateMigrationRepository: Pick<typeof KnowledgeStateMigrationRepository, 'isMigrated' | 'save'>;
  skillRepository: { list: () => Promise<Skill[]> };
  userCompetenceScoreRepository: Pick<typeof UserCompetenceScoreRepository, 'upsert'>;
  logger?: { info: (data: object, message: string) => void };
}): Promise<KnowledgeStateMigrationReport | null> =>
  DomainTransaction.execute(async () => {
    // An answer of the user saved meanwhile waits for the migration to end,
    // and goes to the knowledge states.
    await knowledgeStateRepository.lockUser(userId);
    if (await knowledgeStateMigrationRepository.isMigrated(userId)) {
      return null;
    }

    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });
    logger.info({ userId, knowledgeElements }, 'Knowledge elements of the user to migrate.');
    const skills = await skillRepository.list();

    const { knowledgeStates, userCompetenceScores, unknownSkillIds } = translateKnowledgeElements(
      userId,
      knowledgeElements,
      skills,
    );
    logger.info({ userId, knowledgeStates }, 'Knowledge states built from the knowledge elements.');
    logger.info(
      { userId, userCompetenceScores },
      'Competence scores of the user computed from the knowledge elements.',
    );

    const report = {
      knowledgeElementCount: knowledgeElements.length,
      knowledgeStateCount: knowledgeStates.length,
      unknownSkillIds,
    };

    await knowledgeStateRepository.upsert(knowledgeStates);
    await userCompetenceScoreRepository.upsert(userCompetenceScores);
    await knowledgeStateMigrationRepository.save(userId, report);

    return report;
  });
