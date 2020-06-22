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
    return this.modelFor('campaigns');
  }

  async redirect(campaign) {
    const campaignAssessment = await this.store.query(
      'assessment',
      { filter: { type: 'CAMPAIGN', codeCampaign: campaign.code } },
    );
    const assessment = await campaignAssessment.get('firstObject');

    if (this._shouldShowTutorial(assessment)) {
      return this.replaceWith('campaigns.assessment.tutorial', campaign.code);
    }

    this.replaceWith('assessments.resume', assessment.id);
  }

  _shouldShowTutorial(assessment) {
    return (
      !this.userHasJustConsultedTutorial
      && assessment.answers.length === 0
      && !assessment.isCompleted
      && !this.currentUser.user.hasSeenAssessmentInstructions
    );
  }
}
