import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import { A as EmberArray } from '@ember/array';

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

  tutorialsGroupedByTubeName: computed('scorecard.tutorials', function() {
    const tutorialsGroupedByTubeName = EmberArray();
    const tutorials = this.scorecard.tutorials;

    tutorials.forEach((tutorial) => {
      const foundTube = tutorialsGroupedByTubeName.findBy('name', tutorial.get('tubeName'));

      if (!foundTube) {
        const tube = EmberObject.create({
          name: tutorial.get('tubeName'),
          practicalTitle: tutorial.get('tubePracticalTitle'),
          tutorials: [tutorial]
        });
        tutorialsGroupedByTubeName.pushObject(tube);
      } else {
        foundTube.tutorials.push(tutorial);
      }
    });
    return tutorialsGroupedByTubeName;
  }),

  actions: {
    openModal() {
      this.set('showResetModal', true);
    },

    closeModal() {
      this.set('showResetModal', false);
    },

    reset() {
      this.scorecard.save({ adapterOptions: { resetCompetence: true, userId: this.currentUser.user.id, competenceId: this.get('scorecard.competenceId') } });

      this.set('showResetModal', false);
    }
  },

});
