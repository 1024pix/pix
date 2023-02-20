import { statuses } from './Session';

class JurySession {
  constructor({
    id,
    certificationCenterName,
    certificationCenterType,
    certificationCenterId,
    certificationCenterExternalId,
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
    juryComment,
    juryCommentedAt,
    juryCommentAuthor,
    hasIncident,
    hasJoiningIssue,
  } = {}) {
    this.id = id;
    this.certificationCenterName = certificationCenterName;
    this.certificationCenterType = certificationCenterType;
    this.certificationCenterId = certificationCenterId;
    this.certificationCenterExternalId = certificationCenterExternalId;
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
    this.juryComment = juryComment;
    this.juryCommentedAt = juryCommentedAt;
    this.juryCommentAuthor = juryCommentAuthor;
    this.hasIncident = hasIncident;
    this.hasJoiningIssue = hasJoiningIssue;
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

export default JurySession;
export { statuses };
