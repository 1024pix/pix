import { SESSION_STATUSES } from '../../../src/certification/shared/domain/constants.js';

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
    const status = _computeStatus({
      finalizedAt,
      publishedAt,
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

function _computeStatus({ finalizedAt, publishedAt }) {
  if (publishedAt) {
    return SESSION_STATUSES.PROCESSED;
  }
  if (finalizedAt) {
    return SESSION_STATUSES.FINALIZED;
  }
  return SESSION_STATUSES.CREATED;
}

SessionSummary.statuses = {
  CREATED: SESSION_STATUSES.CREATED,
  FINALIZED: SESSION_STATUSES.FINALIZED,
  PROCESSED: SESSION_STATUSES.PROCESSED,
};

export { SessionSummary };
