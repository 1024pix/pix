import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  scorecard: null,

  level: computed('scorecard.{level,isNotStarted}', function() {
    return this.get('scorecard.isNotStarted') ? null : this.get('scorecard.level');
  }),

  isProgressable: computed('scorecard.{isMaxLevel,isNotStarted,isFinished}', function() {
    return !(this.get('scorecard.isFinished') || this.get('scorecard.isMaxLevel') || this.get('scorecard.isNotStarted'));
  }),

  displayWaitSentence: computed('scorecard.remainingDaysBeforeReset', function() {
    return this.get('scorecard.remainingDaysBeforeReset') > 0;
  }),

  displayResetButton: computed('scorecard.remainingDaysBeforeReset', function() {
    return this.get('scorecard.remainingDaysBeforeReset') === 0;
  }),

  remainingDaysText: computed('scorecard.remainingDaysBeforeReset', function() {
    const daysBeforeReset = this.get('scorecard.remainingDaysBeforeReset');
    return `Remise à zéro disponible dans ${daysBeforeReset} ${daysBeforeReset <= 1 ? 'jour' : 'jours'}`;
  }),

});
