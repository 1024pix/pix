class UserWithActivity {
  constructor({ user, hasAssessmentParticipations, codeForLastProfileToShare }) {
    this.hasAssessmentParticipations = hasAssessmentParticipations;
    this.codeForLastProfileToShare = codeForLastProfileToShare;
    Object.assign(this, user);
  }
}

module.exports = UserWithActivity;
