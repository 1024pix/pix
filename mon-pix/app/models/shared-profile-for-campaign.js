/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr, hasMany } from '@warp-drive/legacy/model';
import uniqBy from 'lodash/uniqBy';

export default class SharedProfileForCampaign extends Model {
  @attr('number') pixScore;
  @attr('number') maxReachablePixScore;
  @attr('number') maxReachableLevel;
  @attr('date') sharedAt;
  @attr('boolean') canRetry;
  @hasMany('scorecard', { async: false, inverse: null }) scorecards;

  get areas() {
    return uniqBy(
      this.scorecards.slice().map((s) => s.area),
      'code',
    );
  }
}
