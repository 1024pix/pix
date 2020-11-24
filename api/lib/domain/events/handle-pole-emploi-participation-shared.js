const { checkEventType } = require('./check-event-type');
const CampaignParticipationResultsShared = require('./CampaignParticipationResultsShared');
const PoleEmploiPayload = require('../../infrastructure/externals/pole-emploi/PoleEmploiPayload');

const eventType = CampaignParticipationResultsShared;

async function handlePoleEmploiParticipationShared({
  event,
  campaignRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
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
    const participationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId);

    const payload = PoleEmploiPayload.buildForParticipationShared({
      user,
      campaign,
      targetProfile,
      participation,
      participationResult,
    });

    console.log(payload.toString());
  }
}

handlePoleEmploiParticipationShared.eventType = eventType;
module.exports = handlePoleEmploiParticipationShared;
