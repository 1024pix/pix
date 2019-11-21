import Component from '@ember/component';
import { computed, trySet } from '@ember/object';

export default Component.extend({
  classNames: ['img-wrapper'],
  src: '',
  alt: '',

  hiddenClass: 'img--hidden',

  displayPlaceholder: computed('src', function() {
    return this.src ? true : false;
  }),

  actions: {
    onImageReady() {
      trySet(this, 'displayPlaceholder', false);
      trySet(this, 'hiddenClass', '');
    }
  },

});
