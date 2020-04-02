import Component from '@ember/component';
import layout from '../templates/components/pix-tooltip';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  getPosition: computed('position', function() {
    const correctsPosition = ['top', 'right', 'bottom', 'left'];
    return correctsPosition.includes(this.position) ? this.position : 'top';
  })
});
