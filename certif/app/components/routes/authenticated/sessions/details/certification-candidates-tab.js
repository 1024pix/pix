import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import _ from 'lodash';

export default class RoutesAuthenticatedSessionsDetailsCertificationCandidatesTab extends Component {

  @tracked candidatesInStaging;

  constructor() {
    super(...arguments);

    this.candidatesInStaging = [];
  }

  get isCandidateBeingAdded() {
    return this.candidatesInStaging.length > 0;
  }

  _fromPercentageStringToDecimal(value) {
    return value ?
      _.toNumber(value) / 100 : value;
  }

  @action
  addCertificationCandidateInStaging() {
    this.candidatesInStaging.pushObject({
      firstName: '', lastName: '', birthdate: '', birthCity: '',
      birthProvinceCode: '', birthCountry: '', email: '', externalId: '',
      extraTimePercentage: '' });
  }

  @action
  async addCertificationCandidate(candidate) {
    const realCertificationCandidateData = { ...candidate };
    realCertificationCandidateData.extraTimePercentage = this._fromPercentageStringToDecimal(candidate.extraTimePercentage);
    const success = await this.args.saveCertificationCandidate(realCertificationCandidateData);
    if (success) {
      this.candidatesInStaging.removeObject(candidate);
    }
  }

  @action
  removeCertificationCandidateFromStaging(candidate) {
    this.candidatesInStaging.removeObject(candidate);
  }
}
