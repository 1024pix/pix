import { SESSION_STATUSES } from '../../../shared/domain/constants.js';

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
    version = 2,
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
    this.version = version;
  }

  get status() {
    if (this.publishedAt) {
      return SESSION_STATUSES.PROCESSED;
    }
    if (this.assignedCertificationOfficer) {
      return SESSION_STATUSES.IN_PROCESS;
    }
    if (this.finalizedAt) {
      return SESSION_STATUSES.FINALIZED;
    }
    return SESSION_STATUSES.CREATED;
  }
}

export { JurySession, SESSION_STATUSES as statuses };
