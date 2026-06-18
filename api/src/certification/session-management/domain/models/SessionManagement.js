import isEmpty from '../../../../shared/infrastructure/utils/is-empty.js';
import { SESSION_STATUSES } from '../../../shared/domain/constants.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';

export class SessionManagement {
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
    version = AlgorithmEngineVersion.V3,
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
    this.examinerGlobalComment = isEmpty(examinerGlobalComment?.trim()) ? null : examinerGlobalComment;
    this.hasIncident = hasIncident;
    this.hasJoiningIssue = hasJoiningIssue;
    this.finalizedAt = finalizedAt;
    this.resultsSentToPrescriberAt = resultsSentToPrescriberAt;
    this.publishedAt = publishedAt;
    this.certificationCandidates = certificationCandidates;
    this.certificationCenterId = certificationCenterId;
    this.assignedCertificationOfficerId = assignedCertificationOfficerId;
    this.version = version;
    this.createdBy = createdBy;
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
}
