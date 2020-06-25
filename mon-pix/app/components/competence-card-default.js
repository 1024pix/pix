import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import config from 'mon-pix/config/environment';

export default class CompetenceCardDefault extends Component {
  @service currentUser;
  @service store;
  @service router;

  get displayImproveButton() {
    return config.APP.FT_IMPROVE_COMPETENCE_EVALUATION;
  }

  get displayedLevel() {
    if (this.args.scorecard.isNotStarted) {
      return null;
    }
    return this.args.scorecard.level;
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
