import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  // Properties
  large: false,

  // Computed properties
  leftWidth: computed('large', function() {
    const large = this.large;
    if (large) {
      return 'col-sm-3';
    } else {
      return 'col-sm-5';
    }
  }),
  rightWidth: computed('large', function() {
    const large = this.large;
    if (large) {
      return 'col-sm-9';
    } else {
      return 'col-sm-7';
    }
  })
});
