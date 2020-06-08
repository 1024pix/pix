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
    } = {}) {
    // attributes
    this.profileDate = profileDate;
    this.userId = userId;
    this.userCompetences = userCompetences;
  }

  isCertifiable() {
    return this.getCertifiableCompetencesCount() >= MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY;
  }

  getCertifiableCompetencesCount() {
    return _(this.userCompetences)
      .filter((userCompetence) => userCompetence.isCertifiable())
      .size();
  }

  getCompetencesCount() {
    return this.userCompetences.length;
  }

  getPixScore() {
    return _.sumBy(this.userCompetences, 'pixScore');
  }
}

module.exports = CertificationProfile;
