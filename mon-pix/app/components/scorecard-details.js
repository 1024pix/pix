import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  scorecard: null,

  level: computed('scorecard.{level,isNotStarted}', function() {
    return this.get('scorecard.isNotStarted') ? null : this.get('scorecard.level');
  }),

  isProgressable: computed('scorecard.{isMaxLevel,isNotStarted}', function() {
    return !(this.get('scorecard.isMaxLevel') || this.get('scorecard.isNotStarted'));
  }),

});
