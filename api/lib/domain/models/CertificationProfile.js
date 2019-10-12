class CertificationProfile {
  constructor(
    {
      // attributes
      profileDate,
      userId,
      userCompetences,
      challengeIdsCorrectlyAnswered,
    } = {}) {
    // attributes
    this.profileDate = profileDate;
    this.userId = userId;
    this.userCompetences = userCompetences;
    this.challengeIdsCorrectlyAnswered = challengeIdsCorrectlyAnswered;
  }
}

module.exports = CertificationProfile;
