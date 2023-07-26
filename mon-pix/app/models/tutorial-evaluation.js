import Model, { attr, belongsTo } from '@ember-data/model';

export default class TutorialEvaluation extends Model {
  @attr('string') status;

  // includes
  @belongsTo('user', { async: true, inverse: null }) user;
  @belongsTo('tutorial', { async: false, inverse: 'tutorialEvaluation' }) tutorial;

  get isLiked() {
    return this.status === 'LIKED';
  }

  get nextStatus() {
    return this.isLiked ? 'NEUTRAL' : 'LIKED';
  }
}
