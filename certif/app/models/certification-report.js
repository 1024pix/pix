import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { none } from '@ember/object/computed';

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  certificationCourseId: attr('number'),
  examinerComment: attr('string'),
  hasSeenEndTestScreen: attr('boolean'),

  certificationCourseIdReadable: computed('certificationCourseId', function() {
    if (this.certificationCourseId) {
      return this.certificationCourseId.toLocaleString();
    }
    return 'Aucun (absent)';
  }),
  isMissing: none('certificationCourseId'),
});
