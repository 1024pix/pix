import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: [ 'tutorial-panel' ],

  hint: null,
  tutorials: null,

  shouldDisplayHintOrTuto: computed('tutorials', 'hint', function() {
    const tutorials = this.tutorials || [];
    const hint = this.hint || [];

    return (hint.length > 0) || (tutorials.length > 0);
  }),

  shouldDisplayHint: computed('hint', function() {
    const hint = this.hint || [];
    return hint.length > 0;
  }),

  shouldDisplayTutorial: computed('tutorials', function() {
    const tutorials = this.tutorials || [];
    return tutorials.length > 0;
  }),

  limitedTutorials: computed('tutorials', function() {
    return this.tutorials.slice(0, 3);
  }),

});
