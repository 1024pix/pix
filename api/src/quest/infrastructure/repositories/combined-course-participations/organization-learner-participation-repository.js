import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  OrganizationLearnerParticipation,
  OrganizationLearnerParticipationTypes,
} from '../../../domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';

export const findByOrganizationLearnerIdAndModuleIds = async ({ organizationLearnerId, moduleIds }) => {
  const participationById = await findByOrganizationLearnerIdsAndModuleIds({
    organizationLearnerIds: [organizationLearnerId],
    moduleIds,
  });
  const participations = participationById.get(organizationLearnerId);
  if (!participations) return [];
  return participations;
};

export const findByOrganizationLearnerIdsAndModuleIds = async ({ organizationLearnerIds, moduleIds }) => {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('organization_learner_participations')
    .select('organization_learner_participations.*') // TODO: refactor to select only the required columns instead of *
    .where({ type: OrganizationLearnerParticipationTypes.PASSAGE })
    .whereIn('organizationLearnerId', organizationLearnerIds)
    .whereIn('referenceId', moduleIds)
    .whereNull('deletedAt');

  const organizationLearnerParticipations = result.map(
    (moduleParticipation) => new OrganizationLearnerParticipation(moduleParticipation),
  );
  return Map.groupBy(
    organizationLearnerParticipations,
    (moduleParticipation) => moduleParticipation.organizationLearnerId,
  );
};

export const synchronize = async ({ organizationLearnerId, moduleIds, modulesApi, organizationLearnerApi }) => {
  if (moduleIds.length === 0) {
    return;
  }

  const knexConn = DomainTransaction.getConnection();

  const learner = await organizationLearnerApi.get(organizationLearnerId);
  const modulePassages = await modulesApi.getUserModuleStatuses({ userId: learner.userId, moduleIds });

  const learnerParticipationsByModule = await knexConn('organization_learner_participations')
    .select('organization_learner_participations.id', 'referenceId')
    .where('organizationLearnerId', organizationLearnerId)
    .whereIn('referenceId', moduleIds);

  const updatedParticipations = [];

  for (const modulePassage of modulePassages) {
    const learnerParticipationModule = learnerParticipationsByModule.find(
      (learnerParticipation) => learnerParticipation.referenceId === modulePassage.id,
    );

    const { id: organizationLearnerParticipationId, ...organizationLearnerPassageParticipation } =
      OrganizationLearnerParticipation.buildFromPassage({
        id: learnerParticipationModule?.id,
        organizationLearnerId,
        createdAt: modulePassage.createdAt,
        status: modulePassage.status,
        updatedAt: modulePassage.updatedAt,
        terminatedAt: modulePassage.terminatedAt,
        moduleId: modulePassage.id,
      });

    updatedParticipations.push(new OrganizationLearnerParticipation(organizationLearnerPassageParticipation));

    if (organizationLearnerParticipationId) {
      await knexConn('organization_learner_participations')
        .update(organizationLearnerPassageParticipation)
        .where('id', organizationLearnerParticipationId);
    } else {
      await knexConn('organization_learner_participations').insert(organizationLearnerPassageParticipation);
    }
  }

  return updatedParticipations;
};

export const deleteCombinedCourseParticipationByCombinedCourseIdAndOrganizationLearnerId = async ({
  combinedCourseId,
  userId,
  organizationLearnerId,
}) => {
  const knexConn = DomainTransaction.getConnection();

  await baseUpdateQuery(knexConn, userId)
    .where('organizationLearnerId', organizationLearnerId)
    .andWhere('referenceId', combinedCourseId.toString());
};

export const deleteCombinedCourseParticipations = async ({ combinedCourseIds, userId }) => {
  const knexConn = DomainTransaction.getConnection();

  const stringifiedCombinedCourseIds = combinedCourseIds.map((id) => id.toString());
  await baseUpdateQuery(knexConn, userId).whereIn(
    'organization_learner_participations.referenceId',
    stringifiedCombinedCourseIds,
  );
};

function baseUpdateQuery(knexConn, userId) {
  return knexConn('organization_learner_participations').update({
    deletedAt: knexConn.fn.now(),
    deletedBy: userId,
    updatedAt: knexConn.fn.now(),
  });
}
