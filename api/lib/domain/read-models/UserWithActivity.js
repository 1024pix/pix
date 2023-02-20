class UserWithActivity {
  constructor({
    user,
    hasAssessmentParticipations,
    codeForLastProfileToShare,
    hasRecommendedTrainings,
    shouldSeeDataProtectionPolicyInformationBanner,
  }) {
    this.hasAssessmentParticipations = hasAssessmentParticipations;
    this.codeForLastProfileToShare = codeForLastProfileToShare;
    this.hasRecommendedTrainings = hasRecommendedTrainings;
    this.shouldSeeDataProtectionPolicyInformationBanner = shouldSeeDataProtectionPolicyInformationBanner;
    Object.assign(this, user);
  }
}

export default UserWithActivity;
