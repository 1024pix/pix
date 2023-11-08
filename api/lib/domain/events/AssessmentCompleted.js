class AssessmentCompleted {
  constructor({ assessmentId, userId, campaignParticipationId, certificationCourseId, locale } = {}) {
    this.assessmentId = assessmentId;
    this.userId = userId;
    this.campaignParticipationId = campaignParticipationId;
    this.certificationCourseId = certificationCourseId;
    this.locale = locale;
  }

  get isCertificationType() {
    return Boolean(this.certificationCourseId);
  }

  get isCampaignType() {
    return Boolean(this.campaignParticipationId);
  }
}

export { AssessmentCompleted };
