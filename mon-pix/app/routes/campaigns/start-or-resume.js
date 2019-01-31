import BaseRoute from 'mon-pix/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  session: service(),
  campaignCode: null,
  campaign: null,
  userHasSeenLanding: false,
  userHasJustConsultedTutorial: false,

  beforeModel(transition) {
    this.set('campaignCode', transition.params['campaigns.start-or-resume'].campaign_code);
    this.set('userHasSeenLanding', transition.queryParams.hasSeenLanding);
    this.set('userHasJustConsultedTutorial', transition.queryParams.hasJustConsultedTutorial);

    if (this._userIsUnauthenticated() && !this.get('userHasSeenLanding')) {
      return this.transitionTo('campaigns.campaign-landing-page', this.get('campaignCode'));
    }
    this._super(...arguments);
  },

  model() {
    const store = this.get('store');
    return store.query('campaign', { filter: { code: this.get('campaignCode') } })
      .then((campaigns) => {
        return this.set('campaign', campaigns.get('firstObject'));
      });
  },

  afterModel() {
    const store = this.get('store');
    return store.query('assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: this.get('campaignCode') } })
      .then((smartPlacementAssessments) => {

        if (this._thereIsNoAssessment(smartPlacementAssessments)) {
          if (this.get('userHasSeenLanding')) {
            return this.transitionTo('campaigns.fill-in-id-pix', this.get('campaignCode'));
          }
          return this.transitionTo('campaigns.campaign-landing-page', this.get('campaignCode'));
        }
        const assessment = smartPlacementAssessments.get('firstObject');
        return assessment.reload();
      })
      .then((assessment) => {
        if (!this.get('userHasJustConsultedTutorial') && assessment.answers.length === 0 && !assessment.isCompleted) {
          return this.transitionTo('campaigns.tutorial', this.get('campaignCode'));
        }
        return this.transitionTo('assessments.resume', assessment.get('id'));
      });
  },

  _userIsUnauthenticated() {
    return this.get('session.isAuthenticated') === false;
  },

  _thereIsNoAssessment(assessments) {
    return isEmpty(assessments);
  }

});
