import Model, { attr, hasMany } from '@ember-data/model';

export default class Profile extends Model {
  @attr('number') pixScore;

  @hasMany('scorecard') scorecards;

  get areasCode() {
    return this.scorecards.mapBy('area.code').uniq();
  }
}
