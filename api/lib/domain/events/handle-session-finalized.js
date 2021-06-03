const FinalizedSession = require('../models/FinalizedSession');
const { checkEventTypes } = require('./check-event-types');
const AutoJuryDone = require('./AutoJuryDone');

const eventTypes = [ AutoJuryDone ];

async function handleSessionFinalized({
  event,
  juryCertificationSummaryRepository,
  finalizedSessionRepository,
}) {
  checkEventTypes(event, eventTypes);
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

handleSessionFinalized.eventTypes = eventTypes;
module.exports = handleSessionFinalized;

