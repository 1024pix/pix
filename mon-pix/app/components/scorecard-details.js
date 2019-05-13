import Component from '@ember/component';
import { computed } from '@ember/object';

function dashIfZero(number) {
  return number === 0 ? '–' : number;
}

export default Component.extend({

  scorecard: null,

  level: computed('scorecard.{level,isNotStarted}', function() {
    return this.scorecard.isNotStarted ? null : dashIfZero(this.scorecard.level);
  }),

  earnedPix: computed('scorecard.earnedPix', function() {
    return dashIfZero(this.scorecard.earnedPix);
  }),

});
