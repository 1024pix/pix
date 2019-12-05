const statuses = {
  STARTED: 'started',
  FINALIZED: 'finalized',
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
    examinerComment,
    // includes
    certifications,
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
    this.examinerComment = examinerComment;
    // includes
    this.certifications = certifications;
    this.certificationCandidates = certificationCandidates;
    // references
  }
}

module.exports = Session;
module.exports.statuses = statuses;
