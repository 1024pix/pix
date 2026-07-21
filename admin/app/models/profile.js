import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class Profile extends Model {
  @attr('number') pixScore;

  @hasMany('scorecard', { async: true, inverse: null }) scorecards;
}
