class AssessmentCompleted {
  constructor(assessmentId, userId, targetProfileId, campaignParticipationId, isCertification) {
    this.assessmentId = assessmentId;
    this.userId = userId;
    this.targetProfileId = targetProfileId;
    this.campaignParticipationId = campaignParticipationId;
    this.isCertification = isCertification;
  }
}

module.exports = AssessmentCompleted;
