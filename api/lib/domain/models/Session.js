const _ = require('lodash');

const CREATED = 'created';
const FINALIZED = 'finalized';

const statuses = {
  CREATED,
  FINALIZED,
};

const NO_EXAMINER_GLOBAL_COMMENT = null;

class Session {
  constructor({
    id,
    // attributes
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    status,
    examinerGlobalComment,
    finalizedAt,
    resultsSentToPrescriberAt,
    // includes
    certificationCandidates,
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.accessCode = accessCode;
    this.address = address;
    this.certificationCenter = certificationCenter;
    this.certificationCenterId = certificationCenterId;
    this.date = date;
    this.description = description;
    this.examiner = examiner;
    this.room = room;
    this.time = time;
    this.status = status;
    this.examinerGlobalComment = examinerGlobalComment;
    this.finalizedAt = finalizedAt;
    this.resultsSentToPrescriberAt = resultsSentToPrescriberAt;
    // includes
    this.certificationCandidates = certificationCandidates;
    // references
  }

  areResultsFlaggedAsSent() {
    return !_.isNil(this.resultsSentToPrescriberAt);
  }
}

module.exports = Session;
module.exports.statuses = statuses;
module.exports.NO_EXAMINER_GLOBAL_COMMENT = NO_EXAMINER_GLOBAL_COMMENT;
