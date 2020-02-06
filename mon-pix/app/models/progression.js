import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({
  completionRate: attr('number'),

  completionPercentage: computed('completionRate', function() {
    return Math.round(this.completionRate * 100);
  }),
});
