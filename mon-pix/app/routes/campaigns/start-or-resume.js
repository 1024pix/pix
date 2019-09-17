import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),
  currentUser: service(),

  campaignCode: null,
  campaign: null,
  givenParticipantExternalId: null,
  userHasSeenLanding: false,
  userHasJustConsultedTutorial: false,
  authenticationRoute: 'inscription',

  beforeModel(transition) {
    this.set('campaignCode', transition.to.params.campaign_code);
    this.set('givenParticipantExternalId', transition.to.queryParams.participantExternalId);
    this.set('userHasSeenLanding', transition.to.queryParams.hasSeenLanding);
    this.set('userHasJustConsultedTutorial', transition.to.queryParams.hasJustConsultedTutorial);

    if (this._userIsUnauthenticated() && !this.userHasSeenLanding) {
      return this.replaceWith('campaigns.campaign-landing-page', this.campaignCode, { queryParams: transition.to.queryParams });
    }
    this._super(...arguments);
  },

  async model() {
    // We don't actually use this model, this request is only made to see if
    // the campaign exists, if not this query get a 404 error and the start-or-resume
    // template is shown instead.
    return this.store.query('campaign', { filter: { code: this.campaignCode } });
  },

  async afterModel() {
    const smartPlacementAssessments = await this.store.query(
      'assessment',
      { filter: { type: 'SMART_PLACEMENT', codeCampaign: this.campaignCode } },
    );

    if (this._thereIsNoAssessment(smartPlacementAssessments)) {
      if (this.userHasSeenLanding) {
        return this.replaceWith('campaigns.fill-in-id-pix', this.campaignCode, { queryParams: { givenParticipantExternalId: this.givenParticipantExternalId } });
      }
      return this.replaceWith('campaigns.campaign-landing-page', this.campaignCode, { queryParams: { givenParticipantExternalId: this.givenParticipantExternalId } });
    }

    const assessment = await smartPlacementAssessments.get('firstObject').reload();

    if (this._showTutorial(assessment)) {
      return this.replaceWith('campaigns.tutorial', this.campaignCode);
    }

    return this.replaceWith('assessments.resume', assessment.get('id'));
  },

  _userIsUnauthenticated() {
    return this.get('session.isAuthenticated') === false;
  },

  _thereIsNoAssessment(assessments) {
    return isEmpty(assessments);
  },

  _showTutorial(assessment) {
    return (
      !this.userHasJustConsultedTutorial
      && assessment.answers.length === 0
      && !assessment.isCompleted
      && !this.currentUser.user.hasSeenAssessmentInstructions
    );
  },
});
