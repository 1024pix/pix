export class CertificationInfo {
  constructor({
    framework,
    startDate,
    expirationDate,
    assessmentDuration,
    minimumAssessmentLength,
    maximumAssessmentLength,
  }) {
    this.framework = framework;
    this.startDate = startDate;
    this.expirationDate = expirationDate;
    this.assessmentDuration = assessmentDuration;
    this.minimumAssessmentLength = minimumAssessmentLength;
    this.maximumAssessmentLength = maximumAssessmentLength;
  }

  get isCertificationActive() {
    return this.startDate !== null && this.expirationDate === null;
  }
}
