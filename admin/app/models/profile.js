import Model, { attr, hasMany } from '@ember-data/model';

export default class Profile extends Model {
  @attr('number') pixScore;

  @hasMany('scorecard', { async: true, inverse: null }) scorecards;
}
