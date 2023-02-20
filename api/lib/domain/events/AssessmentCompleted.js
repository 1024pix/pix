class AssessmentCompleted {
  constructor({ assessmentId, userId, campaignParticipationId, certificationCourseId } = {}) {
    this.assessmentId = assessmentId;
    this.userId = userId;
    this.campaignParticipationId = campaignParticipationId;
    this.certificationCourseId = certificationCourseId;
  }

  get isCertificationType() {
    return Boolean(this.certificationCourseId);
  }

  get isCampaignType() {
    return Boolean(this.campaignParticipationId);
  }
}

export default AssessmentCompleted;
