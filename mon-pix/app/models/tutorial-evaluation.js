import Model, { attr, belongsTo } from '@ember-data/model';

export default class TutorialEvaluation extends Model {
  @attr('string') status;

  // includes
  @belongsTo('user') user;
  @belongsTo('tutorial', { async: false }) tutorial;

  get isLiked() {
    return this.status === 'LIKED';
  }

  get nextStatus() {
    return this.isLiked ? 'NEUTRAL' : 'LIKED';
  }
}
