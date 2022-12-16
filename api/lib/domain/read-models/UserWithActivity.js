class UserWithActivity {
  constructor({ user, hasAssessmentParticipations, codeForLastProfileToShare, hasRecommendedTrainings }) {
    this.hasAssessmentParticipations = hasAssessmentParticipations;
    this.codeForLastProfileToShare = codeForLastProfileToShare;
    this.hasRecommendedTrainings = hasRecommendedTrainings;
    Object.assign(this, user);
  }
}

module.exports = UserWithActivity;
