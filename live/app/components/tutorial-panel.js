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
    const tutorials = this.get('tutorials') || [];
    const hint = this.get('hint') || [];

    return (hint.length > 0) || (tutorials.length > 0);
  }),

  shouldDisplayHint: computed('resultItemStatus', 'hint', function() {
    const hint = this.get('hint') || [];
    return hint.length > 0;
  }),

  shouldDisplayTutorial: computed('resultItemStatus', 'tutorials', function() {
    const tutorials = this.get('tutorials') || [];
    return tutorials.length > 0;
  }),

  limitedTutorials: computed('tutorials', function() {
    return this.get('tutorials').slice(0, 3);
  }),

});
