import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class EvaluationStartOrResumeRoute extends Route {
  @service currentUser;
  @service session;

  userHasJustConsultedTutorial = false;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
    this.userHasJustConsultedTutorial = transition.to.queryParams.hasConsultedTutorial;
    super.beforeModel(...arguments);
  }

  async model() {
    return this.modelFor('campaigns');
  }

  async redirect(campaign) {
    const campaignAssessment = await this.store.query(
      'assessment',
      { filter: { type: 'CAMPAIGN', codeCampaign: campaign.code } },
    );
    const assessment = await campaignAssessment.get('firstObject');

    if (this._shouldShowTutorial(assessment, campaign.isForAbsoluteNovice)) {
      return this.replaceWith('campaigns.assessment.tutorial', campaign.code);
    }

    this.replaceWith('assessments.resume', assessment.id);
  }

  _shouldShowTutorial(assessment, isCampaignForAbsoluteNovice) {
    return (
      !this.userHasJustConsultedTutorial
      && assessment.answers.length === 0
      && !assessment.isCompleted
      && !this.currentUser.user.hasSeenAssessmentInstructions
      && !isCampaignForAbsoluteNovice
    );
  }
}
