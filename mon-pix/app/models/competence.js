import Model, { belongsTo, attr } from '@ember-data/model';
import { alias, equal } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Model.extend({
  name: attr('string'),
  area: belongsTo('area'),
  user: belongsTo('user'),
  index: attr('number'),
  level: attr('number'),
  description: attr('string'),
  areaName: alias('area.name'),
  courseId: attr('string'),
  assessmentId: attr('string'),
  status: attr('string'),
  isRetryable: attr('boolean'),
  daysBeforeNewAttempt: attr('number'),

  isAssessed: equal('status', 'assessed'),
  isNotAssessed: equal('status', 'notAssessed'),
  isBeingAssessed: equal('status', 'assessmentNotCompleted'),

  isAssessableForTheFirstTime: computed('{isNotAssessed,courseId}', function() {
    return Boolean(this.isNotAssessed && this.courseId);
  }),
});
