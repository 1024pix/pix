const { save } = require('../../infrastructure/repositories/assessment-repository');
const FinalizedSession = require('../models/FinalizedSession');
const { checkEventType } = require('./check-event-type');
const SessionFinalized = require('./SessionFinalized');

const eventType = SessionFinalized;

async function handleSessionFinalized({
  event,
  juryCertificationSummaryRepository,
  finalizedSessionRepository,
}) {
  checkEventType(event, eventType);
  const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(event.sessionId);

  const finalizedSession = FinalizedSession.from({
    sessionId: event.sessionId,
    finalizedAt: event.finalizedAt,
    certificationCenterName: event.certificationCenterName,
    sessionDate: event.date,
    sessionTime: event.time,
    hasExaminerGlobalComment: event.hasExaminerGlobalComment,
    juryCertificationSummaries,
  });

  await finalizedSessionRepository.save(finalizedSession);
}

handleSessionFinalized.eventType = eventType;
module.exports = handleSessionFinalized;

