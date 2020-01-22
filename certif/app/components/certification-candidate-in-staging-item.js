import moment from 'moment';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: 'tr',

  isCandidateDataValid: computed('candidateData.{firstName,lastName,birthCountry,birthProvinceCode,birthCity,birthdate}', function() {
    return this.candidateData.firstName &&
      this.candidateData.lastName &&
      this.candidateData.birthCity &&
      this.candidateData.birthProvinceCode &&
      this.candidateData.birthCountry &&
      moment.utc(this.candidateData.birthdate, 'YYYY-MM-DD', true).isValid();
  }),

});
