import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({

  currentUser: service(),
  store: service(),

  scorecard: null,
  showResetModal: false,

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

  actions: {
    openModal() {
      this.set('showResetModal', true);
    },

    closeModal() {
      this.set('showResetModal', false);
    },

    reset() {
      this.currentUser.user.save({ adapterOptions: { resetCompetence: true, competenceId: this.get('scorecard.competenceId') } })
        .then(() => {
          this.get('scorecard').reload();
        });

      this.set('showResetModal', false);
    }
  },

});
