import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: [ 'tutorial-panel' ],

  hint: null,
  resultItemStatus: null,

  shouldDisplayDefaultMessage: computed('resultItemStatus', 'hint', function() {
    return this.get('resultItemStatus') !== 'ok' && !this.get('hint');
  }),

  shouldDisplayHint: computed('resultItemStatus', 'hint', function() {
    return this.get('resultItemStatus') !== 'ok' && Boolean(this.get('hint'));
  }),
});
