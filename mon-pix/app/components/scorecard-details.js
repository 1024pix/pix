import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import EmberObject, { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A as EmberArray } from '@ember/array';
import config from 'mon-pix/config/environment';

export default class ScorecardDetails extends Component {
  @service currentUser;
  @service store;
  @service router;

  @tracked showResetModal = false;

  get level() {
    return this.args.scorecard.isNotStarted ? null : this.args.scorecard.level;
  }

  get isProgressable() {
    return !(this.args.scorecard.isFinished || this.args.scorecard.isMaxLevel || this.args.scorecard.isNotStarted);
  }

  get displayWaitSentence() {
    return this.args.scorecard.remainingDaysBeforeReset > 0;
  }

  get displayResetButton() {
    return this.args.scorecard.remainingDaysBeforeReset === 0;
  }

  get displayImproveButton() {
    return config.APP.FT_IMPROVE_COMPETENCE_EVALUATION;
  }

  get remainingDaysText() {
    const daysBeforeReset = this.args.scorecard.remainingDaysBeforeReset;
    return `Remise à zéro disponible dans ${daysBeforeReset} ${daysBeforeReset <= 1 ? 'jour' : 'jours'}`;
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
            tutorials: [tutorial]
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
    await this.store.queryRecord('competence-evaluation', {
      improve: true,
      userId:this.currentUser.user.id,
      competenceId: this.args.scorecard.competenceId
    });
    this.router.transitionTo('competences.resume', this.args.scorecard.competenceId);
  }
}
