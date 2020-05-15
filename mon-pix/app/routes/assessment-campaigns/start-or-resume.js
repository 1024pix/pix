import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

import { isEmpty } from '@ember/utils';

export default class AssessmentCampaignsStartOrResumeRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;

  campaignCode = null;
  associationDone = false;
  participantExternalId = null;
  userHasSeenLanding = false;
  userHasJustConsultedTutorial = false;

  beforeModel(transition) {
    this.campaignCode = transition.to.parent.params.campaign_code;
    this.associationDone = transition.to.queryParams.associationDone;
    this.participantExternalId = transition.to.queryParams.participantExternalId;
    this.userHasSeenLanding = transition.to.queryParams.hasSeenLanding;
    this.userHasJustConsultedTutorial = transition.to.queryParams.hasJustConsultedTutorial;
    super.beforeModel(...arguments);
  }

  async model() {
    const campaigns = await this.store.query('campaign', { filter: { code: this.campaignCode } });

    return campaigns.get('firstObject');
  }

  async redirect(campaign) {

    const smartPlacementAssessments = await this.store.query(
      'assessment',
      { filter: { type: 'SMART_PLACEMENT', codeCampaign: this.campaignCode } },
    );

    if (this._shouldStartCampaignParticipation(smartPlacementAssessments)) {

      if (this.userHasSeenLanding) {
        return this.replaceWith('campaigns.fill-in-id-pix', this.campaignCode, { queryParams: { participantExternalId: this.participantExternalId } });
      }
      if (!campaign.isRestricted || this.associationDone) {
        return this.replaceWith('campaigns.campaign-landing-page', this.campaignCode, { queryParams: { participantExternalId: this.participantExternalId } });
      }
      return this.replaceWith('restricted-campaigns.join-restricted-campaign', this.campaignCode, { queryParams: { participantExternalId: this.participantExternalId } });
    }

    const assessment = await smartPlacementAssessments.get('firstObject').reload();

    if (this._mustShowTutorial(assessment)) {
      return this.replaceWith('assessment-campaigns.tutorial', this.campaignCode);
    }

    this.replaceWith('assessments.resume', assessment.get('id'));
  }

  _shouldStartCampaignParticipation(assessments) {
    return isEmpty(assessments);
  }

  _mustShowTutorial(assessment) {
    return (
      !this.userHasJustConsultedTutorial
      && assessment.answers.length === 0
      && !assessment.isCompleted
      && !this.currentUser.user.hasSeenAssessmentInstructions
    );
  }
}
