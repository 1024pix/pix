const STARTED = 'started';
const FINALIZED = 'finalized';

const statuses = {
  STARTED,
  FINALIZED,
};

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
    // includes
    this.certificationCandidates = certificationCandidates;
    // references
  }
}

module.exports = Session;
module.exports.statuses = statuses;
