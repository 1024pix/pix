const { checkEventTypes } = require('./check-event-types');
const NewChallengeAsked = require('./NewChallengeAsked');

const eventTypes = [ NewChallengeAsked ];

async function handleUpdateLastQuestionInformation({
  event,
  assessmentRepository,
}) {
  checkEventTypes(event, eventTypes);
  if (event.challengeId) {
    await assessmentRepository.updateLastChallengeIdAsked({ id: event.assessmentId, lastChallengeId: event.challengeId });
  }
}

handleUpdateLastQuestionInformation.eventTypes = eventTypes;
module.exports = handleUpdateLastQuestionInformation;

