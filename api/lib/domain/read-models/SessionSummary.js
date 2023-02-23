const { statuses } = require('../models/Session.js');

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
    return statuses.PROCESSED;
  }
  if (finalizedAt) {
    return statuses.FINALIZED;
  }
  return statuses.CREATED;
}

SessionSummary.statuses = {
  CREATED: statuses.CREATED,
  FINALIZED: statuses.FINALIZED,
  PROCESSED: statuses.PROCESSED,
};

module.exports = SessionSummary;
