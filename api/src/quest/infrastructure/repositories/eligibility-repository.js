import { Eligibility } from '../../domain/models/Eligibility.js';
// We import this repository here to avoid calling it in both dependencies and repositories in ./index.js
import * as questOrganizationLearnerParticipationRepository from './organization-learner-participation-repository.js';

export const find = async ({
  userId,
  quest,
  organizationLearnerApi,
  campaignParticipationsApi,
  organizationLearnerParticipationRepository = questOrganizationLearnerParticipationRepository,
}) => {
  const dataNeeds = quest.getDataNeeds();

  const learnerData = await organizationLearnerApi.findWithOrganizationByUserId({ userId });

  const organizationLearnerIds = learnerData.map((ld) => ld.organizationLearner.id);
  const allCampaignParticipations =
    dataNeeds.needsCampaignParticipations && organizationLearnerIds.length > 0
      ? await campaignParticipationsApi.findByOrganizationLearnerIds({ organizationLearnerIds })
      : [];

  return Promise.all(
    learnerData.map(async (learner) => {
      const campaignParticipations = allCampaignParticipations.filter(
        (p) => p.organizationLearnerId === learner.organizationLearner.id,
      );

      if (!dataNeeds.needsPassages) {
        return toDomain({ ...learner, campaignParticipations });
      }

      const passages = await organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds({
        organizationLearnerId: learner.organizationLearner.id,
        moduleIds: dataNeeds.moduleIds,
      });
      return toDomain({ ...learner, campaignParticipations, passages });
    }),
  );
};

export const findByOrganizationAndOrganizationLearnerId = async ({
  organizationLearnerId,
  organizationId,
  quest,
  organizationLearnerApi,
  campaignParticipationsApi,
  organizationLearnerParticipationRepository = questOrganizationLearnerParticipationRepository,
}) => {
  const dataNeeds = quest.getDataNeeds();

  const [learner] = await organizationLearnerApi.findWithOrganizationByIds({
    organizationLearnerIds: [organizationLearnerId],
    organizationId,
  });

  const campaignParticipations = dataNeeds.needsCampaignParticipations
    ? await campaignParticipationsApi.findByOrganizationLearnerIds({ organizationLearnerIds: [organizationLearnerId] })
    : [];

  const passages = dataNeeds.needsPassages
    ? await organizationLearnerParticipationRepository.findByOrganizationLearnerIdAndModuleIds({
        organizationLearnerId,
        moduleIds: dataNeeds.moduleIds,
      })
    : [];

  return toDomain({ ...learner, campaignParticipations, passages });
};

export const findByOrganizationAndOrganizationLearnerIds = async ({
  organizationLearnerIds,
  organizationId,
  quest,
  organizationLearnerApi,
  campaignParticipationsApi,
  organizationLearnerParticipationRepository = questOrganizationLearnerParticipationRepository,
}) => {
  const dataNeeds = quest.getDataNeeds();

  const learners = await organizationLearnerApi.findWithOrganizationByIds({ organizationLearnerIds, organizationId });

  const allCampaignParticipations = dataNeeds.needsCampaignParticipations
    ? await campaignParticipationsApi.findByOrganizationLearnerIds({ organizationLearnerIds })
    : [];

  const passagesByLearnerId = dataNeeds.needsPassages
    ? await organizationLearnerParticipationRepository.findByOrganizationLearnerIdsAndModuleIds({
        organizationLearnerIds,
        moduleIds: dataNeeds.moduleIds,
      })
    : new Map();

  const eligibilitiesByLearnerId = new Map();
  for (const learner of learners) {
    const organizationLearnerId = learner.organizationLearner.id;
    const campaignParticipations = allCampaignParticipations.filter(
      (p) => p.organizationLearnerId === organizationLearnerId,
    );
    const passages = passagesByLearnerId.get(organizationLearnerId) ?? [];
    eligibilitiesByLearnerId.set(organizationLearnerId, toDomain({ ...learner, campaignParticipations, passages }));
  }
  return eligibilitiesByLearnerId;
};

const toDomain = (organizationLearnersWithParticipations) => new Eligibility(organizationLearnersWithParticipations);
