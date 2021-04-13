const { checkEventType } = require('./check-event-type');
const CampaignParticipationStarted = require('./CampaignParticipationStarted');
const PoleEmploiPayload = require('../../infrastructure/externals/pole-emploi/PoleEmploiPayload');
const PoleEmploiSending = require('../models/PoleEmploiSending');

const eventType = CampaignParticipationStarted;

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
  checkEventType(event, eventType);

  const { campaignParticipationId } = event;

  const participation = await campaignParticipationRepository.get({ id: campaignParticipationId });
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

    const response = await poleEmploiNotifier.notify(user.id, payload.toString());

    const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({
      campaignParticipationId,
      payload: payload.toString(),
      isSuccessful: response.isSuccessful,
      responseCode: response.code,
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
}

handlePoleEmploiParticipationStarted.eventType = eventType;
module.exports = handlePoleEmploiParticipationStarted;
