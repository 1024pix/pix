import { SESSION_STATUSES } from '../../../shared/domain/constants.js';

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
    status,
  } = {}) {
    this.id = id;
    this.address = address;
    this.room = room;
    this.date = date;
    this.time = time;
    this.examiner = examiner;
    this.enrolledCandidatesCount = enrolledCandidatesCount;
    this.effectiveCandidatesCount = effectiveCandidatesCount;
    this.status = status;
  }

  static from({
    id,
    address,
    room,
    date,
    time,
    examiner,
    enrolledCandidatesCount,
    effectiveCandidatesCount,
    finalizedAt,
    publishedAt,
  }) {
    const isExpired = _computeExpireState({ date, time });
    const status = _computeStatus({
      finalizedAt,
      publishedAt,
      isExpired,
    });

    return new SessionSummary({
      id,
      address,
      room,
      date,
      time,
      examiner,
      enrolledCandidatesCount,
      effectiveCandidatesCount,
      status,
    });
  }
}

function _computeExpireState({ date, time }) {
  const startedSessionTime = new Date(`${date}T${time}Z`);
  const expirationSessionTime = startedSessionTime.setDate(startedSessionTime.getDate() + 1);

  return Date.now() > expirationSessionTime;
}

function _computeStatus({ finalizedAt, publishedAt, isExpired }) {
  if (publishedAt) {
    return SESSION_STATUSES.PROCESSED;
  }
  if (finalizedAt) {
    return SESSION_STATUSES.FINALIZED;
  }
  if (isExpired) {
    return SESSION_STATUSES.TO_FINALIZE;
  }
  return SESSION_STATUSES.CREATED;
}

SessionSummary.statuses = {
  CREATED: SESSION_STATUSES.CREATED,
  TO_FINALIZE: SESSION_STATUSES.TO_FINALIZE,
  FINALIZED: SESSION_STATUSES.FINALIZED,
  PROCESSED: SESSION_STATUSES.PROCESSED,
};

export { SessionSummary };
