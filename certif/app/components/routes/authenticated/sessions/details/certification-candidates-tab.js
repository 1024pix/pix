import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.candidatesInStaging = [];
  },

  isCandidateBeingAdded: computed('candidatesInStaging.[]', function() {
    return this.candidatesInStaging.length > 0;
  }),

  _fromPercentageStringToDecimal(value) {
    return value ?
      _.toNumber(value) / 100 : value;
  },

  actions: {
    addCertificationCandidateInStaging() {
      this.get('candidatesInStaging').pushObject({
        firstName: '', lastName: '', birthdate: '', birthCity: '',
        birthProvinceCode: '', birthCountry: '', email: '', externalId: '',
        extraTimePercentage: '' });
    },

    async addCertificationCandidate(candidate) {
      const realCertificationCandidateData = { ...candidate };
      realCertificationCandidateData.extraTimePercentage = this._fromPercentageStringToDecimal(candidate.extraTimePercentage);
      const success = await this.saveCertificationCandidate(realCertificationCandidateData);
      if (success) {
        this.get('candidatesInStaging').removeObject(candidate);
      }
    },

    removeCertificationCandidateFromStaging(candidate) {
      this.get('candidatesInStaging').removeObject(candidate);
    },
  },
});
