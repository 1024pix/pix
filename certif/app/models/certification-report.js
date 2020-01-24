import Model, { attr } from '@ember-data/model';

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  certificationCourseId: attr('number'),
  examinerComment: attr('string'),
  hasSeenEndTestScreen: attr('boolean'),
});
