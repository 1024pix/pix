import Model, { belongsTo, attr } from '@ember-data/model';
import { alias, equal } from '@ember/object/computed';
import { computed } from '@ember/object';

export default class Competence extends Model {

  // attributes
  @attr('number') daysBeforeNewAttempt;
  @attr('string') description;
  @attr('number') index;
  @attr('boolean') isRetryable;
  @attr('number') level;
  @attr('string') name;
  @attr('string') status;
  @alias('area.name') areaName;

  // references
  @attr('string') assessmentId;
  @attr('string') courseId;

  // includes
  @belongsTo('area') area;
  @belongsTo('user') user;

  // methods
  @equal('status', 'assessed') isAssessed;
  @equal('status', 'notAssessed') isNotAssessed;
  @equal('status', 'assessmentNotCompleted') isBeingAssessed;

  @computed('{isNotAssessed,courseId}')
  get isAssessableForTheFirstTime() {
    return Boolean(this.isNotAssessed && this.courseId);
  }
}
