export class FrameworkHistoryEntry {
  constructor({ id, startDate, expirationDate, assessmentDuration, maximumAssessmentLength, status }) {
    this.id = id;
    this.startDate = startDate ?? null;
    this.expirationDate = expirationDate ?? null;
    this.assessmentDuration = assessmentDuration;
    this.maximumAssessmentLength = maximumAssessmentLength;
    this.status = status;
  }
}
