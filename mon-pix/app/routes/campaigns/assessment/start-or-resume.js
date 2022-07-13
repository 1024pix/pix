import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class EvaluationStartOrResumeRoute extends Route {
  @service currentUser;
  @service session;
  @service router;

  userHasJustConsultedTutorial = false;

  beforeModel(transition) {
    this.userHasJustConsultedTutorial = transition.to.queryParams.hasConsultedTutorial;
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    return this.modelFor('campaigns.assessment');
  }

  async redirect({ assessment, campaign }) {
    if (this._shouldShowTutorial(assessment, campaign.isForAbsoluteNovice)) {
      this.router.replaceWith('campaigns.assessment.tutorial', campaign.code);
    } else {
      this.router.replaceWith('assessments.resume', assessment.id);
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
