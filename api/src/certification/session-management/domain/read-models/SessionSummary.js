import { SESSION_STATUSES } from '../../../shared/domain/value-objects/SessionStatus.ts';

class SessionSummary {
  constructor({
    id,
    address,
    room,
    date,
    time,
    examiner,
    enrolledCandidatesCount,
    effectiveCandidatesCount,
    sessionStatus,
  }) {
    this.id = id;
    this.address = address;
    this.room = room;
    this.date = date;
    this.time = time;
    this.examiner = examiner;
    this.enrolledCandidatesCount = enrolledCandidatesCount;
    this.effectiveCandidatesCount = effectiveCandidatesCount;
    this.status = getStatus(sessionStatus);
  }
}

function getStatus(sessionStatus) {
  if (sessionStatus.isAtMostStarted()) {
    return SESSION_STATUSES.CREATED;
  }
  if (sessionStatus.isToFinalize()) {
    return SESSION_STATUSES.TO_FINALIZE;
  }
  if (sessionStatus.isAtMostInProcess()) {
    return SESSION_STATUSES.FINALIZED;
  }
  return SESSION_STATUSES.PROCESSED;
}

export { SessionSummary };
