import Model, { attr, hasMany } from '@warp-drive/legacy/model';
import uniqBy from 'lodash/uniqBy';
export default class Profile extends Model {
  @attr('number') pixScore;
  @attr('number') maxReachablePixScore;
  @attr('number') maxReachableLevel;

  @hasMany('scorecard', { async: false, inverse: null }) scorecards;
  get areas() {
    return uniqBy(
      this.scorecards.slice().map((s) => s.area),
      'code',
    );
  }
}
