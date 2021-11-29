import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class EvaluationStartOrResumeRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;

  userHasJustConsultedTutorial = false;

  beforeModel(transition) {
    this.userHasJustConsultedTutorial = transition.to.queryParams.hasConsultedTutorial;
    super.beforeModel(...arguments);
  }

  async model() {
    return this.modelFor('campaigns.assessment');
  }

  async redirect({ assessment, campaign }) {
    if (this._shouldShowTutorial(assessment, campaign.isForAbsoluteNovice)) {
      this.replaceWith('campaigns.assessment.tutorial', campaign.code);
    } else {
      this.replaceWith('assessments.resume', assessment.id);
    }
  }

  _shouldShowTutorial(assessment, isCampaignForAbsoluteNovice) {
    return (
      !this.userHasJustConsultedTutorial &&
      assessment.answers?.length === 0 &&
      !assessment.isCompleted &&
      !this.currentUser.user.hasSeenAssessmentInstructions &&
      !isCampaignForAbsoluteNovice
    );
  }
}
