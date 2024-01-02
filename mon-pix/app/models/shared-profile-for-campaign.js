/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr, hasMany } from '@ember-data/model';
import uniqBy from 'lodash/uniqBy';

export default class SharedProfileForCampaign extends Model {
  @attr('number') pixScore;
  @attr('number') maxReachablePixScore;
  @attr('number') maxReachableLevel;
  @attr('date') sharedAt;
  @attr('boolean') canRetry;
  @hasMany('scorecard', { async: true, inverse: null }) scorecards;

  get areas() {
    return uniqBy(
      this.scorecards.map((s) => s.area),
      'code',
    );
  }
}
