import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  displayHelp: 'hexagon-score__information--hide',

  score: computed('pixScore', function() {
    return (isNone(this.pixScore) || this.pixScore === 0) ? '–' : Math.floor(this.pixScore);
  }),

  actions: {
    hideHelp: function() {
      this.set('displayHelp', 'hexagon-score__information--hide');
    },
    showHelp: function() {
      this.set('displayHelp', 'hexagon-score__information--show');
    }
  }
});
