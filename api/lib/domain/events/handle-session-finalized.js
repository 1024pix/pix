const FinalizedSession = require('../models/FinalizedSession');
const { checkEventTypes } = require('./check-event-types');
const SessionFinalized = require('./SessionFinalized');

const eventType = SessionFinalized;

async function handleSessionFinalized({
  event,
  juryCertificationSummaryRepository,
  finalizedSessionRepository,
}) {
  checkEventTypes(event, [eventType]);
  const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(event.sessionId);

  const finalizedSession = FinalizedSession.from({
    sessionId: event.sessionId,
    finalizedAt: event.finalizedAt,
    certificationCenterName: event.certificationCenterName,
    sessionDate: event.sessionDate,
    sessionTime: event.sessionTime,
    hasExaminerGlobalComment: event.hasExaminerGlobalComment,
    juryCertificationSummaries,
  });

  await finalizedSessionRepository.save(finalizedSession);
}

handleSessionFinalized.eventType = eventType;
module.exports = handleSessionFinalized;

