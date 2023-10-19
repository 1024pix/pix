import { service } from '@ember/service';
import Component from '@glimmer/component';
import EmberObject, { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A as EmberArray } from '@ember/array';

export default class ScorecardDetails extends Component {
  @service currentUser;
  @service store;
  @service router;
  @service competenceEvaluation;
  @service featureToggles;

  @tracked showResetModal = false;

  get displayImprovingWaitSentence() {
    return !this.args.scorecard.isImprovable && !this.args.scorecard.isFinishedWithMaxLevel;
  }

  get displayImprovingButton() {
    return this.args.scorecard.isImprovable;
  }

  get displayCongrats() {
    return this.args.scorecard.isFinishedWithMaxLevel;
  }

  get displayRemainingPixToNextLevel() {
    return this.args.scorecard.isProgressable;
  }

  get displayResetWaitSentence() {
    return !this.args.scorecard.isResettable;
  }

  get displayResetButton() {
    return this.args.scorecard.isResettable;
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
    this.args.scorecard.save({
      adapterOptions: {
        resetCompetence: true,
        userId: this.currentUser.user.id,
        competenceId: this.args.scorecard.competenceId,
      },
    });

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
