import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr } = DS;

export default Model.extend({

  name: attr('string'),
  description: attr('string'),
  duration: attr('number'),
  imageUrl: attr('string'),
  isAdaptive: attr('boolean'),
  nbChallenges: attr('number'),
  type: attr('string'),
  accessCode : attr('string'),

  isDemo: computed('type', 'lastName', function() {
    return this.get('type')==='DEMO';
  }),
});
