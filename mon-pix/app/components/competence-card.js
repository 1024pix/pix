import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  scorecard: null,

  displayedLevel: computed('scorecard.{level,isNotStarted}', function() {
    if (this.scorecard.isNotStarted) {
      return null;
    } else if (!this.scorecard.level) {
      return '-';
    }
    return this.scorecard.level;
  }),
});
