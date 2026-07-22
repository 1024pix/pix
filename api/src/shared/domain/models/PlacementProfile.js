/**
 * @typedef {import('./UserCompetence.js').UserCompetence} UserCompetence
 */
import _ from 'lodash';

import { MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY } from '../../constants.js';

class PlacementProfile {
  /**
   * @param {Object} params
   * @param {Date} params.profileDate
   * @param {number} params.userId
   * @param {Array<UserCompetence>} params.userCompetences
   */
  constructor({ profileDate, userId, userCompetences } = {}) {
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

  getUserCompetence(competenceId) {
    return _.find(this.userCompetences, { id: competenceId }) || null;
  }
}

export { PlacementProfile };
