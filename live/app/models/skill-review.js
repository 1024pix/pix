import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  profileMasteryRate: DS.attr('number'),

  profileMasteryPercentage: computed('profileMasteryRate', function() {
    return Number((this.get('profileMasteryRate') * 100).toFixed(1)) + ' %';
  }),
});
