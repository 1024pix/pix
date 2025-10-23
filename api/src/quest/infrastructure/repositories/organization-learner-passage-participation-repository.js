import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import {
  OrganizationLearnerParticipation,
  OrganizationLearnerParticipationTypes,
} from '../../domain/models/OrganizationLearnerParticipation.js';

export const synchronize = async ({ organizationLearnerId, moduleIds, modulesApi, organizationLearnerApi }) => {
  if (moduleIds.length === 0) {
    return;
  }

  const knexConn = DomainTransaction.getConnection();

  const learner = await organizationLearnerApi.get(organizationLearnerId);
  const modulePassages = await modulesApi.getUserModuleStatuses({ userId: learner.userId, moduleIds });

  const learnerParticipationsByModule = await knexConn('organization_learner_participations')
    .select('organization_learner_participations.id', 'moduleId', 'referenceId')
    .leftJoin(
      'organization_learner_passage_participations',
      'organization_learner_participations.id',
      'organization_learner_passage_participations.organizationLearnerParticipationId',
    )
    .where({ organizationLearnerId: organizationLearnerId, type: OrganizationLearnerParticipationTypes.PASSAGE })
    .whereNull('deletedAt')
    .where(function () {
      this.whereIn('moduleId', moduleIds).orWhereIn('referenceId', moduleIds);
    });

  for (const modulePassage of modulePassages) {
    const learnerParticipationModule = learnerParticipationsByModule.find(
      (learnerParticipation) =>
        learnerParticipation.moduleId === modulePassage.id || learnerParticipation.referenceId === modulePassage.id,
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

    if (organizationLearnerParticipationId) {
      await knexConn('organization_learner_participations')
        .update(organizationLearnerPassageParticipation)
        .where('id', organizationLearnerParticipationId);
    } else {
      await knexConn('organization_learner_participations').insert(organizationLearnerPassageParticipation);
    }
  }
};
