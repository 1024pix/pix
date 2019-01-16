import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  validationRate: DS.attr('number'),
  completionRate: DS.attr('number'),

  masteryPercentage: computed('validationRate', function() {
    return Number((this.get('validationRate') * 100).toFixed(0)) + '%';
  }),

  completionPercentage: computed('completionRate', function() {
    return Number((this.get('completionRate') * 100).toFixed(0)) + '%';
  }),
});
