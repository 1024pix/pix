import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CompetenceCardDefault extends Component {
  @service currentUser;
  @service competenceEvaluation;

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
    const userId = this.currentUser.user.id;
    const competenceId = this.args.scorecard.competenceId;
    const scorecardId = this.args.scorecard.id;
    return this.competenceEvaluation.improve({ userId, competenceId, scorecardId });
  }

}
