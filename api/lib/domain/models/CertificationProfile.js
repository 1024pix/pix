const {
  MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY,
} = require('../constants');
const _ = require('lodash');

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

  isCertifiable() {
    return this.getCertifiableCompetencesCount() >= MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY;
  }

  getCertifiableCompetencesCount() {
    return _(this.userCompetences)
      .filter((userCompetence) => userCompetence.isCertifiable())
      .size();
  }
}

module.exports = CertificationProfile;
