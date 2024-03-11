/* eslint ember/no-computed-properties-in-native-classes: 0 */

import { computed } from '@ember/object';
import Model, { attr } from '@ember-data/model';

export default class Progression extends Model {
  // attributes
  @attr('number') completionRate;

  // methods
  @computed('completionRate')
  get completionPercentage() {
    return Math.round(this.completionRate * 100);
  }
}
