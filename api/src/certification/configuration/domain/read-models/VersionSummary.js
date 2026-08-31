export class VersionSummary {
  constructor({ id, startDate, expirationDate, assessmentDuration, maximumAssessmentLength, status, hasGlobalScoring }) {
    this.id = id;
    this.startDate = startDate ?? null;
    this.expirationDate = expirationDate ?? null;
    this.assessmentDuration = assessmentDuration;
    this.maximumAssessmentLength = maximumAssessmentLength;
    this.status = status;
    this.hasGlobalScoring = hasGlobalScoring ?? false;
  }
}
