import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class Progression extends Model {

  // attributes
  @attr('number') completionRate;

  // methods
  @computed('completionRate')
  get completionPercentage() {
    return Math.round(this.completionRate * 100);
  }
}
