import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({

  name: attr('string'),
  description: attr('string'),
  duration: attr('number'),
  imageUrl: attr('string'),
  nbChallenges: attr('number'),
  type: attr('string'),

  isDemo: computed('type', function() {
    return this.type === 'DEMO';
  }),
});
