import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  radial: 37,
  result: 0.25,

  roundProgressBarDashArray: computed('radial', function() {
    return 2*this.get('radial')*Math.PI;
  }),
  roundProgressBarDashOffset: computed('roundProgressBarDashArray', 'result', function() {
    return this.get('roundProgressBarDashArray')*(1-this.get('result'))
  })
});
