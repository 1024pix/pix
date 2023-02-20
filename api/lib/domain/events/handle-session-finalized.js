import FinalizedSession from '../models/FinalizedSession';
import { checkEventTypes } from './check-event-types';
import AutoJuryDone from './AutoJuryDone';

const eventTypes = [AutoJuryDone];

async function handleSessionFinalized({
  event,
  juryCertificationSummaryRepository,
  finalizedSessionRepository,
  supervisorAccessRepository,
}) {
  checkEventTypes(event, eventTypes);
  const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(event.sessionId);

  const hasSupervisorAccess = await supervisorAccessRepository.sessionHasSupervisorAccess({
    sessionId: event.sessionId,
  });

  const finalizedSession = FinalizedSession.from({
    sessionId: event.sessionId,
    finalizedAt: event.finalizedAt,
    certificationCenterName: event.certificationCenterName,
    sessionDate: event.sessionDate,
    sessionTime: event.sessionTime,
    hasExaminerGlobalComment: event.hasExaminerGlobalComment,
    hasSupervisorAccess,
    juryCertificationSummaries,
  });

  await finalizedSessionRepository.save(finalizedSession);
}

handleSessionFinalized.eventTypes = eventTypes;
export default handleSessionFinalized;
