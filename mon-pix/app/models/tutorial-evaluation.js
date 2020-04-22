import Model, { attr, belongsTo } from '@ember-data/model';

export default class TutorialEvaluation extends Model {
  // attributes
  @attr('date') updatedAt;
  // includes
  @belongsTo('user') user;
  @belongsTo('tutorial', { async: false }) tutorial;
}
