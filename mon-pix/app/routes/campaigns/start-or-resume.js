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

  model() {
    const store = this.store;
    return store.query('campaign', { filter: { code: this.campaignCode } })
      .then((campaigns) => {
        return this.set('campaign', campaigns.get('firstObject'));
      });
  },

  afterModel() {
    const store = this.store;
    return store.query('assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: this.campaignCode } })
      .then((smartPlacementAssessments) => {

        if (this._thereIsNoAssessment(smartPlacementAssessments)) {
          if (this.userHasSeenLanding) {
            return this.transitionTo('campaigns.fill-in-id-pix', this.campaignCode);
          }
          return this.transitionTo('campaigns.campaign-landing-page', this.campaignCode);
        }
        const assessment = smartPlacementAssessments.get('firstObject');
        return assessment.reload();
      })
      .then((assessment) => {
        if (!this.userHasJustConsultedTutorial && assessment.answers.length === 0 && !assessment.isCompleted) {
          return this.transitionTo('campaigns.tutorial', this.campaignCode);
        }
        return this.transitionTo('assessment.resume', assessment.get('id'));
      });
  },

  _userIsUnauthenticated() {
    return this.get('session.isAuthenticated') === false;
  },

  _thereIsNoAssessment(assessments) {
    return isEmpty(assessments);
  }

});
