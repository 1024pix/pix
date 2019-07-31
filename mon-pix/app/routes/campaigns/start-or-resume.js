import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),

  campaignCode: null,
  campaign: null,
  userHasSeenLanding: false,
  userHasJustConsultedTutorial: false,
  authenticationRoute: 'inscription',

  beforeModel(transition) {
    this.set('campaignCode', transition.to.params.campaign_code);
    this.set('userHasSeenLanding', transition.to.queryParams.hasSeenLanding);
    this.set('userHasJustConsultedTutorial', transition.to.queryParams.hasJustConsultedTutorial);

    if (this._userIsUnauthenticated() && !this.userHasSeenLanding) {
      return this.transitionTo('campaigns.campaign-landing-page', this.campaignCode);
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
        return this.transitionTo('campaigns.fill-in-id-pix', this.campaignCode);
      }
      return this.transitionTo('campaigns.campaign-landing-page', this.campaignCode);
    }

    const assessment = await smartPlacementAssessments.get('firstObject').reload();

    if (!this.userHasJustConsultedTutorial && assessment.answers.length === 0 && !assessment.isCompleted) {
      return this.transitionTo('campaigns.tutorial', this.campaignCode);
    }

    return this.transitionTo('assessments.resume', assessment.get('id'));
  },

  _userIsUnauthenticated() {
    return this.get('session.isAuthenticated') === false;
  },

  _thereIsNoAssessment(assessments) {
    return isEmpty(assessments);
  },
});
