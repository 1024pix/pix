class UserWithActivity {
  constructor({
    user,
    hasAssessmentParticipations,
    codeForLastProfileToShare,
    hasRecommendedTrainings,
    shouldSeeDataProtectionPolicyInformationBanner,
    anonymousUserToken = null,
  }) {
    this.hasAssessmentParticipations = hasAssessmentParticipations;
    this.codeForLastProfileToShare = codeForLastProfileToShare;
    this.hasRecommendedTrainings = hasRecommendedTrainings;
    this.shouldSeeDataProtectionPolicyInformationBanner = shouldSeeDataProtectionPolicyInformationBanner;
    this.anonymousUserToken = anonymousUserToken;
    Object.assign(this, user);
  }
}

export { UserWithActivity };
