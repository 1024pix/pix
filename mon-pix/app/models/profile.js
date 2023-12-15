import Model, { attr, hasMany } from '@ember-data/model';

export default class Profile extends Model {
  @attr('number') pixScore;
  @attr('number') maxReachablePixScore;
  @attr('number') maxReachableLevel;

  @hasMany('scorecard', { async: false, inverse: null }) scorecards;

  get areas() {
    return this.scorecards.map((s) => s.area).uniqBy('code');
  }
}
