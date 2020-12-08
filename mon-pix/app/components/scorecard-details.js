import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import EmberObject, { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A as EmberArray } from '@ember/array';
import buttonStatusTypes from 'mon-pix/utils/button-status-types';

export default class ScorecardDetails extends Component {
  @service currentUser;
  @service store;
  @service router;
  @service competenceEvaluation;

  @tracked showResetModal = false;

  get level() {
    return this.args.scorecard.isNotStarted ? null : this.args.scorecard.level;
  }

  get isProgressable() {
    return !(this.args.scorecard.isFinished || this.args.scorecard.isMaxLevel || this.args.scorecard.isNotStarted);
  }

  get canImprove() {
    return !this.args.scorecard.isFinishedWithMaxLevel;
  }

  get displayWaitSentence() {
    return this.args.scorecard.remainingDaysBeforeReset > 0;
  }

  get displayResetButton() {
    return this.args.scorecard.remainingDaysBeforeReset === 0;
  }

  get shouldWaitBeforeImproving() {
    return this.args.scorecard.remainingDaysBeforeImproving > 0;
  }

  get isImprovingButtonDisabled() {
    return this.improveButtonStatus === buttonStatusTypes.pending;
  }

  get tutorialsGroupedByTubeName() {
    const tutorialsGroupedByTubeName = EmberArray();
    const tutorials = this.args.scorecard.tutorials;

    if (tutorials) {
      tutorials.forEach((tutorial) => {
        const foundTube = tutorialsGroupedByTubeName.findBy('name', tutorial.tubeName);

        if (!foundTube) {
          const tube = EmberObject.create({
            name: tutorial.tubeName,
            practicalTitle: tutorial.tubePracticalTitle,
            tutorials: [tutorial],
          });
          tutorialsGroupedByTubeName.pushObject(tube);
        } else {
          foundTube.tutorials.push(tutorial);
        }
      });
    }
    return tutorialsGroupedByTubeName;
  }

  @action
  openModal() {
    this.showResetModal = true;
  }

  @action
  closeModal() {
    this.showResetModal = false;
  }

  @action
  reset() {
    this.args.scorecard.save({ adapterOptions: { resetCompetence: true, userId: this.currentUser.user.id, competenceId: this.args.scorecard.competenceId } });

    this.showResetModal = false;
  }

  @action
  async improveCompetenceEvaluation() {
    const userId = this.currentUser.user.id;
    const competenceId = this.args.scorecard.competenceId;
    const scorecardId = this.args.scorecard.id;
    return this.competenceEvaluation.improve({ userId, competenceId, scorecardId });
  }

}
