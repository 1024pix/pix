const { checkEventType } = require('./check-event-type');
const CampaignParticipationResultsShared = require('./CampaignParticipationResultsShared');

const eventType = CampaignParticipationResultsShared;

async function handleCampaignParticipationResultsSending({
  event,
  organizationRepository,
}) {
  checkEventType(event, eventType);

  const organization = await organizationRepository.get(event.organizationId);
  if (event.isAssessment && organization.isPoleEmploi) {
    console.log('resultats mockés');
  }
}

handleCampaignParticipationResultsSending.eventType = eventType;
module.exports = handleCampaignParticipationResultsSending;
