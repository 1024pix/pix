import _ from 'lodash';

import { SESSION_STATUSES } from '../../../shared/domain/constants.js';
import { CERTIFICATION_VERSIONS } from '../../../shared/domain/models/CertificationVersion.js';

const NO_EXAMINER_GLOBAL_COMMENT = null;

class SessionManagement {
  constructor({
    id,
    accessCode,
    address,
    certificationCenter,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment,
    hasIncident,
    hasJoiningIssue,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    certificationCandidates,
    certificationCenterId,
    assignedCertificationOfficerId,
    invigilatorPassword,
    version = CERTIFICATION_VERSIONS.V2,
    createdBy,
  } = {}) {
    this.id = id;
    this.accessCode = accessCode;
    this.address = address;
    this.certificationCenter = certificationCenter;
    this.date = date;
    this.description = description;
    this.examiner = examiner;
    this.room = room;
    this.time = time;
    this.examinerGlobalComment = examinerGlobalComment;
    this.hasIncident = hasIncident;
    this.hasJoiningIssue = hasJoiningIssue;
    this.finalizedAt = finalizedAt;
    this.resultsSentToPrescriberAt = resultsSentToPrescriberAt;
    this.publishedAt = publishedAt;
    this.certificationCandidates = certificationCandidates;
    this.certificationCenterId = certificationCenterId;
    this.assignedCertificationOfficerId = assignedCertificationOfficerId;
    this.invigilatorPassword = invigilatorPassword;
    this.version = version;
    this.createdBy = createdBy;
  }

  areResultsFlaggedAsSent() {
    return !_.isNil(this.resultsSentToPrescriberAt);
  }

  get status() {
    if (this.publishedAt) {
      return SESSION_STATUSES.PROCESSED;
    }
    if (this.assignedCertificationOfficerId) {
      return SESSION_STATUSES.IN_PROCESS;
    }
    if (this.finalizedAt) {
      return SESSION_STATUSES.FINALIZED;
    }
    return SESSION_STATUSES.CREATED;
  }

  isAccessible() {
    return this.status === SESSION_STATUSES.CREATED;
  }

  isPublished() {
    return this.publishedAt !== null;
  }

  isSupervisable(invigilatorPassword) {
    return this.invigilatorPassword === invigilatorPassword;
  }
}

export { NO_EXAMINER_GLOBAL_COMMENT, SessionManagement };
