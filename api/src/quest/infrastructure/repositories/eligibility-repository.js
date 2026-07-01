import { Eligibility } from '../../domain/models/quests/aggregates/Eligibility.js';
// We import this repository here to avoid calling it in both dependencies and repositories in ./index.js
import * as questOrganizationLearnerParticipationRepository from './combined-course-participations/organization-learner-participation-repository.js';
export const find = async ({ userId, organizationLearnerWithParticipationApi }) => {
  const result = await organizationLearnerWithParticipationApi.find({ userIds: [userId] });
  return result.map(toDomain);
};

export const findByOrganizationAndOrganizationLearnerId = async ({
  organizationLearnerId,
  organizationId,
  organizationLearnerWithParticipationApi,
  organizationLearnerParticipationRepository = questOrganizationLearnerParticipationRepository,
  moduleIds = [],
}) => {
  const passages = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds({
    organizationLearnerId,
    moduleIds,
  });
  const result = await organizationLearnerWithParticipationApi.findByOrganizationAndOrganizationLearnerId({
    organizationLearnerId,
    organizationId,
  });
  return toDomain({ ...result, passages });
};

export const findByOrganizationAndOrganizationLearnerIds = async ({
  organizationLearnerIds,
  organizationId,
  organizationLearnerWithParticipationApi,
  organizationLearnerParticipationRepository = questOrganizationLearnerParticipationRepository,
  moduleIds = [],
}) => {
  const passagesByLearnerId = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdsAndModuleIds(
    {
      organizationLearnerIds,
      moduleIds,
    },
  );
  const resultsByLearnerId = await organizationLearnerWithParticipationApi.findByOrganizationAndOrganizationLearnerIds({
    organizationLearnerIds,
    organizationId,
  });

  const eligibilitiesByLearnerId = new Map();
  for (const organizationLearnerId of organizationLearnerIds) {
    const result = resultsByLearnerId.get(organizationLearnerId);
    const passages = passagesByLearnerId.get(organizationLearnerId) ?? [];
    if (result) {
      eligibilitiesByLearnerId.set(organizationLearnerId, toDomain({ ...result, passages }));
    }
  }
  return eligibilitiesByLearnerId;
};

const toDomain = (organizationLearnersWithParticipations) => new Eligibility(organizationLearnersWithParticipations);
