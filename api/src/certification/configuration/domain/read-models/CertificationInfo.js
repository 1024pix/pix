import { VERSION_STATUSES } from '../models/Version.js';

export class CertificationInfo {
  constructor({ framework, status, assessmentDuration, minimumAssessmentLength, maximumAssessmentLength }) {
    this.framework = framework;
    this.status = status;
    this.assessmentDuration = assessmentDuration;
    this.minimumAssessmentLength = minimumAssessmentLength;
    this.maximumAssessmentLength = maximumAssessmentLength;
  }

  get isActive() {
    return this.status === VERSION_STATUSES.ACTIVE;
  }
}
