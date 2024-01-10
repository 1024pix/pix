export class V3CertificationCourseDetailsForAdministration {
  constructor({
    certificationCourseId,
    certificationChallengesForAdministration = [],
    isRejectedForFraud,
    isCancelled,
    createdAt,
    completedAt,
    assessmentState,
    assessmentResultStatus,
    abortReason,
    pixScore,
  }) {
    this.certificationCourseId = certificationCourseId;
    this.isRejectedForFraud = isRejectedForFraud;
    this.isCancelled = isCancelled;
    this.certificationChallengesForAdministration = certificationChallengesForAdministration;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.assessmentState = assessmentState;
    this.assessmentResultStatus = assessmentResultStatus;
    this.abortReason = abortReason;
    this.pixScore = pixScore;
  }

  setCompetencesDetails(competenceList) {
    this.certificationChallengesForAdministration.forEach((challenge) => {
      challenge.setCompetenceDetails(competenceList);
    });
  }
}
