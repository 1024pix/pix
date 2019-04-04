import { alias, equal } from '@ember/object/computed';
import { computed } from '@ember/object';
import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  area: belongsTo('area'),
  user: belongsTo('user'),
  index: attr('number'),
  level: attr('number'),
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
