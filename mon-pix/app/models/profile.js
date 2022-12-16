import Model, { attr, hasMany } from '@ember-data/model';

export default class Profile extends Model {
  @attr('number') pixScore;

  @hasMany('scorecard') scorecards;

  get areas() {
    return this.scorecards.mapBy('area').uniqBy('code');
  }
}
