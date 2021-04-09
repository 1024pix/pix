const { checkEventType } = require('./check-event-type');
const PoleEmploiPayload = require('../../infrastructure/externals/pole-emploi/PoleEmploiPayload');
const AssessmentCompleted = require('./AssessmentCompleted');
const PoleEmploiSending = require('../models/PoleEmploiSending');

const eventType = AssessmentCompleted;

async function handlePoleEmploiParticipationFinished({
  event,
  domainTransaction,
  assessmentRepository,
  campaignParticipationRepository,
  campaignRepository,
  organizationRepository,
  poleEmploiSendingRepository,
  targetProfileRepository,
  userRepository,
  poleEmploiNotifier,
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

    const response = await poleEmploiNotifier.notify(user.id, payload.toString());

    const poleEmploiSending = PoleEmploiSending.buildForParticipationFinished({
      campaignParticipationId,
      payload: payload.toString(),
      isSuccessful: response.isSuccessful,
      responseCode: response.code,
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending, domainTransaction });
  }
}

handlePoleEmploiParticipationFinished.eventType = eventType;
module.exports = handlePoleEmploiParticipationFinished;
