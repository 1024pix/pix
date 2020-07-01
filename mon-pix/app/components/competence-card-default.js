import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import config from 'mon-pix/config/environment';

export default class CompetenceCardDefault extends Component {
  @service currentUser;
  @service store;
  @service router;

  get computeRemainingDaysBeforeImproving() {
    const _remainingDaysBeforeImproving = this.args.scorecard.remainingDaysBeforeImproving;

    if (_remainingDaysBeforeImproving > 1) {
      return _remainingDaysBeforeImproving + ' jours';
    } else {
      return _remainingDaysBeforeImproving + ' jour';
    }
  }

  get displayImproveButton() {
    return config.APP.FT_IMPROVE_COMPETENCE_EVALUATION;
  }

  get displayedLevel() {
    if (this.args.scorecard.isNotStarted) {
      return null;
    }
    return this.args.scorecard.level;
  }

  get shouldWaitBeforeImproving() {
    return this.args.scorecard.remainingDaysBeforeImproving > 0;
  }

  @action
  async improveCompetenceEvaluation() {
    await this.store.queryRecord('competence-evaluation', {
      improve: true,
      userId: this.currentUser.user.id,
      competenceId: this.args.scorecard.competenceId
    });

    this.router.transitionTo('competences.resume', this.args.scorecard.competenceId);
  }

}
