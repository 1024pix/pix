import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { type KnowledgeElement } from '../../../shared/domain/models/KnowledgeElement.js';
import { type Skill } from '../../../shared/domain/models/Skill.js';
import { UserCompetenceScore } from '../../../shared/domain/models/UserCompetenceScore.ts';
import { buildKnowledgeStatesFromKnowledgeElements } from '../../../shared/domain/services/knowledge-state/build-knowledge-states-from-knowledge-elements.ts';
import type * as KnowledgeStateMigrationRepository from '../../../shared/infrastructure/repositories/knowledge-state-migration-repository.ts';
import type * as KnowledgeStateRepository from '../../../shared/infrastructure/repositories/knowledge-state-repository.ts';
import type * as UserCompetenceScoreRepository from '../../../shared/infrastructure/repositories/user-competence-score-repository.ts';

const MAX_PIX_BY_COMPETENCE = 64;

export type KnowledgeStateMigrationReport = {
  knowledgeElementCount: number;
  knowledgeStateCount: number;
  unknownSkillIds: string[];
};

type DatedKnowledgeElement = KnowledgeElement & { createdAt: Date };

/**
 * Moves the knowledge of a user from knowledge elements to knowledge states.
 *
 * The knowledge states of the user are built from their latest knowledge elements,
 * the pix they earned are stored as competence scores, and the user is added
 * to the migration table: from then on, the knowledge element repository
 * reads and saves their knowledge through the knowledge states.
 *
 * The knowledge elements are left untouched: removing the user from the
 * migration table brings them back as they were at the time of the migration.
 *
 * Returns the report stored with the migration, or null when the user was
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
  knowledgeStateRepository: Pick<typeof KnowledgeStateRepository, 'save'>;
  knowledgeStateMigrationRepository: typeof KnowledgeStateMigrationRepository;
  skillRepository: { list: () => Promise<Skill[]> };
  userCompetenceScoreRepository: Pick<typeof UserCompetenceScoreRepository, 'save'>;
}): Promise<KnowledgeStateMigrationReport | null> =>
  DomainTransaction.execute(async () => {
    const migratedUserIds = await knowledgeStateMigrationRepository.findMigratedUserIds({ userIds: [userId] });
    if (migratedUserIds.has(userId)) {
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
    const earnedPixByCompetenceId = Map.groupBy(
      knowledgeElements.filter(({ competenceId }) => Boolean(competenceId)),
      ({ competenceId }) => competenceId,
    );
    const userCompetenceScores = [...earnedPixByCompetenceId].map(
      ([competenceId, competenceKnowledgeElements]) =>
        new UserCompetenceScore({
          userId,
          competenceId,
          pix: Math.min(
            MAX_PIX_BY_COMPETENCE,
            competenceKnowledgeElements.reduce((pix, { earnedPix }) => pix + earnedPix, 0),
          ),
        }),
    );

    const report = {
      knowledgeElementCount: knowledgeElements.length,
      knowledgeStateCount: knowledgeStates.length,
      unknownSkillIds: [
        ...new Set(knowledgeElements.map(({ skillId }) => skillId).filter((skillId) => !knownSkillIds.has(skillId))),
      ],
    };

    await knowledgeStateRepository.save({ knowledgeStates });
    await userCompetenceScoreRepository.save(userCompetenceScores);
    await knowledgeStateMigrationRepository.save({ userId, report });

    return report;
  });
