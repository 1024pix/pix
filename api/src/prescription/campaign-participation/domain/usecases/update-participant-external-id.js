import * as injectedParticipationsForCampaignManagementRepository from '../../infrastructure/repositories/participations-for-campaign-management-repository.js';
const updateParticipantExternalId = async function ({
  campaignParticipationId,
  participantExternalId,
  participationsForCampaignManagementRepository = injectedParticipationsForCampaignManagementRepository,
} = {}) {
  await participationsForCampaignManagementRepository.updateParticipantExternalId({
    campaignParticipationId,
    participantExternalId,
  });
};

export { updateParticipantExternalId };
