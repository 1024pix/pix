import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import config from 'mon-pix/config/environment';
import buttonStatusTypes from 'mon-pix/utils/button-status-types';

export default class CompetenceCardDefault extends Component {
  @service currentUser;
  @service store;
  @service router;
  @service competenceEvaluation;
  @tracked improveButtonStatus = buttonStatusTypes.unrecorded;

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

  get isImprovingButtonDisabled() {
    return this.improveButtonStatus === buttonStatusTypes.pending;
  }

  @action
  async improveCompetenceEvaluation() {
    this.improveButtonStatus = buttonStatusTypes.pending;

    const userId = this.currentUser.user.id;
    const competenceId = this.args.scorecard.competenceId;
    const scorecardId = this.args.scorecard.id;
    try {
      this.competenceEvaluation.improve({ userId, competenceId, scorecardId });
    } catch {
      this.improveButtonStatus = buttonStatusTypes.unrecorded;
    }
  }

}
