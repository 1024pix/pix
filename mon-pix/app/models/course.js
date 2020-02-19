import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class Course extends Model {

  // attributes
  @attr('string') description;
  @attr('number') duration;
  @attr('string') imageUrl;
  @attr('string') name;
  @attr('number') nbChallenges;
  @attr('string') type;

  // methods
  @computed('type')
  get isDemo() {
    return this.type === 'DEMO';
  }
}
