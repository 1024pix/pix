import DS from 'ember-data';
import { computed } from '@ember/object';
import { none } from '@ember/object/computed';

export default DS.Model.extend({
  firstName: DS.attr(),
  lastName: DS.attr(),
  birthdate: DS.attr('date-only'),
  birthCity: DS.attr('string'),
  birthProvinceCode: DS.attr('string'),
  birthCountry: DS.attr('string'),
  email: DS.attr('string'),
  externalId: DS.attr('string'),
  extraTimePercentage: DS.attr('number'),
  isLinked: DS.attr('boolean'),
  certificationCourseId: DS.attr('number'),
  examinerComment: DS.attr(),
  hasSeenEndTestScreen: DS.attr('boolean'),

  certificationCourseIdReadable: computed('certificationCourseId', function() {
    if (this.certificationCourseId) {
      return this.certificationCourseId.toLocaleString();
    }
    return 'Aucun (absent)';
  }),
  isMissing: none('certificationCourseId'),
});
