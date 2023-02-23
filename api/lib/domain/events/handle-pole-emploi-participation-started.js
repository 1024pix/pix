const { checkEventTypes } = require('./check-event-types.js');
const CampaignParticipationStarted = require('./CampaignParticipationStarted.js');
const PoleEmploiPayload = require('../../infrastructure/externals/pole-emploi/PoleEmploiPayload.js');
const PoleEmploiSending = require('../models/PoleEmploiSending.js');

const eventTypes = [CampaignParticipationStarted];

async function handlePoleEmploiParticipationStarted({
  event,
  campaignRepository,
  campaignParticipationRepository,
  organizationRepository,
  poleEmploiSendingRepository,
  targetProfileRepository,
  userRepository,
  poleEmploiNotifier,
}) {
  checkEventTypes(event, eventTypes);

  const { campaignParticipationId } = event;

  const participation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (campaign.isAssessment() && organization.isPoleEmploi) {
    const user = await userRepository.get(participation.userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);

    const payload = PoleEmploiPayload.buildForParticipationStarted({
      user,
      campaign,
      targetProfile,
      participation,
    });

    const response = await poleEmploiNotifier.notify(user.id, payload);

    const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({
      campaignParticipationId,
      payload: payload.toString(),
      isSuccessful: response.isSuccessful,
      responseCode: response.code,
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
}

handlePoleEmploiParticipationStarted.eventTypes = eventTypes;
module.exports = handlePoleEmploiParticipationStarted;
