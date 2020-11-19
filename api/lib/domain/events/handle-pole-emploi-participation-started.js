const { checkEventType } = require('./check-event-type');
const CampaignParticipationStarted = require('./CampaignParticipationStarted');
const PoleEmploiPayload = require('../../infrastructure/externals/pole-emploi/PoleEmploiPayload');

const eventType = CampaignParticipationStarted;

async function handlePoleEmploiParticipationStarted({
  event,
  campaignRepository,
  campaignParticipationRepository,
  organizationRepository,
  targetProfileRepository,
  userRepository,
}) {
  checkEventType(event, eventType);

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

    console.log(payload.toString());
  }
}

handlePoleEmploiParticipationStarted.eventType = eventType;
module.exports = handlePoleEmploiParticipationStarted;
