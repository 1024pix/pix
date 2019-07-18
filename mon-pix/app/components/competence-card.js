import Component from '@ember/component';
import { computed } from '@ember/object';
const MAX_REACHABLE_LEVEL = 5;

export default Component.extend({
  scorecard: null,

  displayedLevel: computed('scorecard.{level,isNotStarted}', function() {
    if (this.scorecard.isNotStarted) {
      return null;
    }
    return Math.min(this.scorecard.level, MAX_REACHABLE_LEVEL);
  }),
});
