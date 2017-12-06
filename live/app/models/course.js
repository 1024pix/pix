import { computed } from '@ember/object';
import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({

  name: attr('string'),
  description: attr('string'),
  duration: attr('number'),
  imageUrl: attr('string'),
  isAdaptive: attr('boolean'),
  nbChallenges: attr('number'),
  type: computed('isAdaptive', function() {
    return this.get('isAdaptive') ? 'PLACEMENT' : 'DEMO';
  })

});
