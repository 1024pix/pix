const { statuses } = require('./Session');

class JurySession {
  constructor({
    id,
    certificationCenterName,
    certificationCenterType,
    address,
    room,
    examiner,
    date,
    time,
    accessCode,
    description,
    examinerGlobalComment,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficer,
  } = {}) {
    this.id = id;
    this.certificationCenterName = certificationCenterName;
    this.certificationCenterType = certificationCenterType;
    this.address = address;
    this.room = room;
    this.examiner = examiner;
    this.date = date;
    this.time = time;
    this.accessCode = accessCode;
    this.description = description;
    this.examinerGlobalComment = examinerGlobalComment;
    this.finalizedAt = finalizedAt;
    this.resultsSentToPrescriberAt = resultsSentToPrescriberAt;
    this.publishedAt = publishedAt;
    this.assignedCertificationOfficer = assignedCertificationOfficer;
  }

  get status() {
    if (this.publishedAt) {
      return statuses.PROCESSED;
    }
    if (this.assignedCertificationOfficer) {
      return statuses.IN_PROCESS;
    }
    if (this.finalizedAt) {
      return statuses.FINALIZED;
    }
    return statuses.CREATED;
  }
}

module.exports = JurySession;
module.exports.statuses = statuses;
