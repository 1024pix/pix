import { MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY } from '../constants';
import _ from 'lodash';

class PlacementProfile {
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

  getCertifiableUserCompetences() {
    return this.userCompetences.filter((uc) => uc.isCertifiable());
  }
}

export default PlacementProfile;
