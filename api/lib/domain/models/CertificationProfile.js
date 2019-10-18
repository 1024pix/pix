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
    const certifiableCompetences = _(this.userCompetences)
      .filter((userCompetence) => userCompetence.isCertifiable())
      .size();

    return certifiableCompetences >= MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY;
  }
}

module.exports = CertificationProfile;
