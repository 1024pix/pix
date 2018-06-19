import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  profileMastery: DS.attr('number'),

  profileMasteryInPourcent: computed('profileMastery', function() {
    return Number((this.get('profileMastery') * 100).toFixed(1));
  }),
});
