import { inject as service } from '@ember/service';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import EmberObject, { action, computed } from '@ember/object';
import { A as EmberArray } from '@ember/array';

@classic
export default class ScorecardDetails extends Component {
  @service
  currentUser;

  @service
  store;

  scorecard = null;
  showResetModal = false;

  @computed('scorecard.{level,isNotStarted}')
  get level() {
    return this.scorecard.isNotStarted ? null : this.scorecard.level;
  }

  @computed('scorecard.{isMaxLevel,isNotStarted,isFinished}')
  get isProgressable() {
    return !(this.scorecard.isFinished || this.scorecard.isMaxLevel || this.scorecard.isNotStarted);
  }

  @computed('scorecard.remainingDaysBeforeReset')
  get displayWaitSentence() {
    return this.scorecard.remainingDaysBeforeReset > 0;
  }

  @computed('scorecard.remainingDaysBeforeReset')
  get displayResetButton() {
    return this.scorecard.remainingDaysBeforeReset === 0;
  }

  @computed('scorecard.remainingDaysBeforeReset')
  get remainingDaysText() {
    const daysBeforeReset = this.scorecard.remainingDaysBeforeReset;
    return `Remise à zéro disponible dans ${daysBeforeReset} ${daysBeforeReset <= 1 ? 'jour' : 'jours'}`;
  }

  @computed('scorecard.tutorials')
  get tutorialsGroupedByTubeName() {
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
  }

  @action
  openModal() {
    this.set('showResetModal', true);
  }

  @action
  closeModal() {
    this.set('showResetModal', false);
  }

  @action
  reset() {
    this.scorecard.save({ adapterOptions: { resetCompetence: true, userId: this.currentUser.user.id, competenceId: this.scorecard.competenceId } });

    this.set('showResetModal', false);
  }
}
