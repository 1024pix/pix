import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({

  totalGaugeStyle: computed('total', function() {
    return htmlSafe(`width: ${this.total}%`);
  }),

  valueGaugeStyle: computed('value', function() {
    return htmlSafe(`width: ${this.value}%`);
  }),

});
