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

  const { organizationId, campaignId, userId, campaignParticipationId } = event;

  const campaign = await campaignRepository.get(campaignId);
  const organization = await organizationRepository.get(organizationId);

  if (campaign.isAssessment() && organization.isPoleEmploi) {

    const user = await userRepository.get(userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
    const participation = await campaignParticipationRepository.get(campaignParticipationId);
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
