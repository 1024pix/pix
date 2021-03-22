const ChallengeRequested = require('../events/ChallengeRequested');
const { checkEventType } = require('./check-event-type');

const eventType = ChallengeRequested;

module.exports = async function handleChallengeRequested({
  event,
  assessmentRepository,
}) {
  checkEventType(event, eventType);

  await assessmentRepository.updateLastQuestionDate({ id: event.assessmentId, lastQuestionDate: new Date() });
};

module.exports.eventType = eventType;

