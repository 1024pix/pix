import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: [ 'tutorial-panel' ],

  hint: null,
  resultItemStatus: null,
  tutorials: null,

  shouldDisplayTipsToSucceed: computed('resultItemStatus', function() {
    return this.get('resultItemStatus') !== 'ok';
  }),

  shouldDisplayHintOrTuto: computed('resultItemStatus', function() {
    return Boolean(this.get('hint')) || this.get('tutorials').length > 0;
  }),

  shouldDisplayHint: computed('resultItemStatus', 'hint', function() {
    return Boolean(this.get('hint'));
  }),

  shouldDisplayTutorial: computed('resultItemStatus', 'tutorials', function() {
    return this.get('tutorials').length > 0;
  }),

  limitedTutorials: computed('tutorials', function() {
    return this.get('tutorials').slice(0, 3);
  }),

});
