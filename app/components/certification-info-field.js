import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  large:false,
  leftWidth:computed('large', function() {
    let large = this.get('large');
    if (large) {
      return 'col-sm-3';
    } else {
      return 'col-sm-5';
    }
  }),
  rightWidth:computed('large', function() {
    let large = this.get('large');
    if (large) {
      return 'col-sm-9';
    } else {
      return 'col-sm-7';
    }
  })
});
