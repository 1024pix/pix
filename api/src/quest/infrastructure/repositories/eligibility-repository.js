import { Eligibility } from '../../domain/models/Eligibility.js';
// We import this repository here to avoid calling it in both dependencies and repositories in ./index.js
import * as questOrganizationLearnerParticipationRepository from './organization-learner-participation-repository.js';

export const find = async ({
  userId,
  quest,
  organizationLearnerWithParticipationApi,
  organizationLearnerParticipationRepository = questOrganizationLearnerParticipationRepository,
}) => {
  const dataNeeds = quest.getDataNeeds();
  const result = await organizationLearnerWithParticipationApi.find({ userIds: [userId] });

  if (!dataNeeds.needsPassages) {
    return result.map(toDomain);
  }

  return Promise.all(
    result.map(async (learnerData) => {
      const passages = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds({
        organizationLearnerId: learnerData.organizationLearner.id,
        moduleIds: dataNeeds.moduleIds,
      });
      return toDomain({ ...learnerData, passages });
    }),
  );
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
