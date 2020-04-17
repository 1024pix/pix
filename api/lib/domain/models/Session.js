const _ = require('lodash');

const CREATED = 'created';
const FINALIZED = 'finalized';
const IN_PROCESS = 'in_process';
const PROCESSED = 'processed';

const statuses = {
  CREATED,
  FINALIZED,
  IN_PROCESS,
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
    examinerGlobalComment,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    // includes
    certificationCandidates,
    // references
    certificationCenterId,
    assignedCertificationOfficerId,
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
    this.examinerGlobalComment = examinerGlobalComment;
    this.finalizedAt = finalizedAt;
    this.resultsSentToPrescriberAt = resultsSentToPrescriberAt;
    this.publishedAt = publishedAt;
    // includes
    this.certificationCandidates = certificationCandidates;
    // references
    this.certificationCenterId = certificationCenterId;
    this.assignedCertificationOfficerId = assignedCertificationOfficerId;
  }

  areResultsFlaggedAsSent() {
    return !_.isNil(this.resultsSentToPrescriberAt);
  }

  get status() {
    if (this.publishedAt) {
      return statuses.PROCESSED;
    }
    if (this.assignedCertificationOfficerId) {
      return statuses.IN_PROCESS;
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
