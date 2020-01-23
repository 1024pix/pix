import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { none } from '@ember/object/computed';

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  birthdate: attr('date-only'),
  birthCity: attr('string'),
  birthProvinceCode: attr('string'),
  birthCountry: attr('string'),
  email: attr('string'),
  externalId: attr('string'),
  extraTimePercentage: attr('number'),
  isLinked: attr('boolean'),
  certificationCourseId: attr('number'),
  examinerComment: attr(),
  hasSeenEndTestScreen: attr('boolean'),

  certificationCourseIdReadable: computed('certificationCourseId', function() {
    if (this.certificationCourseId) {
      return this.certificationCourseId.toLocaleString();
    }
    return 'Aucun (absent)';
  }),
  isMissing: none('certificationCourseId'),
});
