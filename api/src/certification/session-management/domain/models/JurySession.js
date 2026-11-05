/**
 * @typedef {import ('./CertificationOfficer.js').CertificationOfficer} CertificationOfficer
 * @typedef {import ('../read-models/JurySessionCounters.js').JurySessionCounters} JurySessionCounters
 */

class JurySession {
  /**
   * @param {object} props
   * @param {number} props.id
   * @param {string} props.certificationCenterName
   * @param {string} props.certificationCenterType
   * @param {number} props.certificationCenterId
   * @param {string} props.address
   * @param {string} props.room
   * @param {string} props.examiner
   * @param {string} props.date
   * @param {string} props.time
   * @param {string} props.accessCode
   * @param {string} props.description
   * @param {string} props.examinerGlobalComment
   * @param {Date} props.createdAt
   * @param {Date} props.finalizedAt
   * @param {Date} props.resultsSentToPrescriberAt
   * @param {Date} props.publishedAt
   * @param {CertificationOfficer} props.assignedCertificationOfficer
   * @param {string} props.juryComment
   * @param {Date} props.juryCommentedAt
   * @param {CertificationOfficer} props.juryCommentAuthor
   * @param {boolean} props.hasIncident
   * @param {bollean} props.hasJoiningIssue
   * @param {number} props.version
   * @param {JurySessionCounters} props.counters - session statistics
   */
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
    createdAt,
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
    counters,
    sessionStatus,
  }) {
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
    this.createdAt = createdAt;
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
    this.numberOfStartedCertifications = counters.startedCertifications;
    this.numberOfScoringErrors = counters.certificationsWithScoringError;
    this.totalNumberOfIssueReports = counters.issueReports;
    this.numberOfImpactfullIssueReports = counters.impactfullIssueReports;
    this.sessionStatus = sessionStatus;
  }

  get status() {
    return this.sessionStatus.status;
  }
}

export { JurySession };
