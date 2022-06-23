import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class EvaluationStartOrResumeRoute extends Route {
  @service currentUser;
  @service session;
  @service router;

  userHasJustConsultedTutorial = false;

  beforeModel(transition) {
    const isUserLoaded = !!this.currentUser.user;
    const isAuthenticated = this.session.get('isAuthenticated');
    if (!isAuthenticated || !isUserLoaded) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('login');
    } else if (this.currentUser.user.mustValidateTermsOfService) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('terms-of-service');
    } else {
      return super.beforeModel(...arguments);
    }
    this.userHasJustConsultedTutorial = transition.to.queryParams.hasConsultedTutorial;
    super.beforeModel(...arguments);
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
