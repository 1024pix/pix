const _ = require('lodash');

const CREATED = 'created';
const FINALIZED = 'finalized';
const PROCESSED = 'processed';

const statuses = {
  CREATED,
  FINALIZED,
  PROCESSED,
};

const NO_EXAMINER_GLOBAL_COMMENT = null;

class Session {
  constructor({
    id,
    // attributes
    accessCode,
    address,
    certificationCenter,
    date,
    description,
    examiner,
    room,
    time,
    status,
    examinerGlobalComment,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    // includes
    certificationCandidates,
    // references
    certificationCenterId,
  } = {}) {
    this.id = id;
    // attributes
    this.accessCode = accessCode;
    this.address = address;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.description = description;
    this.examiner = examiner;
    this.room = room;
    this.time = time;
    this.status = status;
    this.examinerGlobalComment = examinerGlobalComment;
    this.finalizedAt = finalizedAt;
    this.resultsSentToPrescriberAt = resultsSentToPrescriberAt;
    this.publishedAt = publishedAt;
    // includes
    this.certificationCandidates = certificationCandidates;
    // references
    this.certificationCenterId = certificationCenterId;
  }

  areResultsFlaggedAsSent() {
    return !_.isNil(this.resultsSentToPrescriberAt);
  }

  get computedStatus() {
    if (this.publishedAt) {
      return statuses.PROCESSED;
    }
    if (this.finalizedAt) {
      return statuses.FINALIZED;
    }
    return statuses.CREATED;
  }
}

module.exports = Session;
module.exports.statuses = statuses;
module.exports.NO_EXAMINER_GLOBAL_COMMENT = NO_EXAMINER_GLOBAL_COMMENT;
