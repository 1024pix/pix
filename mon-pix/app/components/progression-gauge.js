import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

  total: null,
  value: null,

  barStyle: computed('total', function() {
    return htmlSafe(`width: ${this.get('total')}%`);
  }),

  progressionStyle: computed('value', function() {
    return htmlSafe(`width: ${this.get('value')}%`);
  }),

});
