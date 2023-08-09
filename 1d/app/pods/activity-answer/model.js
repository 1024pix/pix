import Model, { attr, belongsTo } from '@ember-data/model';

export default class ActivityAnswer extends Model {
  @attr('string') value;
  @attr('string') result;
  @attr('string') resultDetails;
  @belongsTo('challenge', { async: true, inverse: 'activityAnswers' }) challenge;
}
