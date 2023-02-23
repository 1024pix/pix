const { checkEventTypes } = require('./check-event-types.js');
const PoleEmploiPayload = require('../../infrastructure/externals/pole-emploi/PoleEmploiPayload.js');
const AssessmentCompleted = require('./AssessmentCompleted.js');
const PoleEmploiSending = require('../models/PoleEmploiSending.js');

const eventTypes = [AssessmentCompleted];

async function handlePoleEmploiParticipationFinished({
  event,
  assessmentRepository,
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

  if (!campaignParticipationId) return;

  const participation = await campaignParticipationRepository.get(campaignParticipationId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (campaign.isAssessment() && organization.isPoleEmploi) {
    const user = await userRepository.get(participation.userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
    const assessment = await assessmentRepository.get(participation.lastAssessment.id);

    const payload = PoleEmploiPayload.buildForParticipationFinished({
      user,
      campaign,
      targetProfile,
      participation,
      assessment,
    });
    const response = await poleEmploiNotifier.notify(user.id, payload);

    const poleEmploiSending = PoleEmploiSending.buildForParticipationFinished({
      campaignParticipationId,
      payload: payload.toString(),
      isSuccessful: response.isSuccessful,
      responseCode: response.code,
    });

    return poleEmploiSendingRepository.create({ poleEmploiSending });
  }
}

handlePoleEmploiParticipationFinished.eventTypes = eventTypes;
module.exports = handlePoleEmploiParticipationFinished;
