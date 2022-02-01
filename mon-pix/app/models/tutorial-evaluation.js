import Model, { belongsTo } from '@ember-data/model';

export default class TutorialEvaluation extends Model {
  // includes
  @belongsTo('user') user;
  @belongsTo('tutorial', { async: false }) tutorial;
}
