import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({

  classNames: ['circle-chart'],

  strokeWidthStyle: computed('strokeWidth', function() {
    return htmlSafe(`stroke-width: ${this.strokeWidth}`);
  }),

  chartWidthStyle: computed('chartWidth', function() {
    return htmlSafe(`width: ${this.chartWidth}px; height: ${this.chartWidth}px`);
  }),

});
