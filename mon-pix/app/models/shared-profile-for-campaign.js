/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class SharedProfileForCampaign extends Model {
  @attr('number') pixScore;
  @attr('number') maxReachablePixScore;
  @attr('number') maxReachableLevel;
  @attr('date') sharedAt;
  @attr('boolean') canRetry;
  @hasMany('scorecard', { async: true, inverse: null }) scorecards;

  @computed('scorecards.@each.area')
  get areas() {
    return this.scorecards.map((s) => s.area).uniqBy('code');
  }
}
