/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class User extends Model {

  // attributes
  // includes
  @attr('number') pixScore;
  @hasMany('scorecard') scorecards;

  // methods
  @computed('scorecards.@each.area')
  get areasCode() {
    return this.scorecards.mapBy('area.code').uniq();
  }
}
