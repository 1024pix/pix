const { checkEventType } = require('./check-event-type');
const PoleEmploiPayload = require('../../infrastructure/externals/pole-emploi/PoleEmploiPayload');
const AssessmentCompleted = require('./AssessmentCompleted');

const eventType = AssessmentCompleted;

async function handlePoleEmploiParticipationFinished({
  event,
  campaignRepository,
  campaignParticipationRepository,
  organizationRepository,
  targetProfileRepository,
  assessmentRepository,
  userRepository,
}) {
  checkEventType(event, eventType);

  const { campaignParticipationId } = event;

  if (!campaignParticipationId) return;

  const participation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (campaign.isAssessment() && organization.isPoleEmploi) {

    const user = await userRepository.get(participation.userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
    const assessment = await assessmentRepository.get(participation.assessmentId);

    const payload = PoleEmploiPayload.buildForParticipationFinished({
      user,
      campaign,
      targetProfile,
      participation,
      assessment,
    });

    console.log(payload.toString());
  }
}

handlePoleEmploiParticipationFinished.eventType = eventType;
module.exports = handlePoleEmploiParticipationFinished;
