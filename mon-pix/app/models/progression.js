import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  completionRate: DS.attr('number'),

  completionPercentage: computed('completionRate', function() {
    return Math.round(this.completionRate * 100);
  }),
});
