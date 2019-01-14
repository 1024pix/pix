import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  masteryRate: DS.attr('number'),
  completionRate: DS.attr('number'),

  masteryPercentage: computed('masteryRate', function() {
    return Number((this.get('masteryRate') * 100).toFixed(0)) + '%';
  }),

  completionPercentage: computed('completionRate', function() {
    return Number((this.get('completionRate') * 100).toFixed(0)) + '%';
  }),
});
