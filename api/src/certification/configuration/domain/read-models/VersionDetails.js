export class VersionDetails {
  constructor({
    id,
    startDate,
    expirationDate,
    assessmentDuration,
    minimumAnswersRequiredForValidation,
    maximumAssessmentLength,
    status,
    comments,
    areas,
  }) {
    this.id = id;
    this.startDate = startDate;
    this.expirationDate = expirationDate;
    this.assessmentDuration = assessmentDuration;
    this.minimumAnswersRequiredForValidation = minimumAnswersRequiredForValidation;
    this.maximumAssessmentLength = maximumAssessmentLength;
    this.status = status;
    this.comments = comments;
    this.areas = areas;
  }
}
