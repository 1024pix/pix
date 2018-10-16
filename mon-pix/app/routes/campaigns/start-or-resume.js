import BaseRoute from 'mon-pix/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  session: service(),
  campaignCode: null,
  campaign: null,
  userHasSeenLanding: false,

  beforeModel(transition) {
    this.set('campaignCode', transition.params['campaigns.start-or-resume'].campaign_code);
    this.set('userHasSeenLanding', transition.queryParams.hasSeenLanding);

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
        return this._fetchChallenge(assessment)
          .then((challenge) => {
            if (challenge) {
              return this.transitionTo('assessments.challenge', { assessment, challenge });
            } else {
              return this.transitionTo('campaigns.skill-review', this.get('campaignCode'), assessment.get('id'));
            }
          });

      });
  },

  _fetchChallenge(assessment) {
    const store = this.get('store');
    return assessment.reload()
      .then(() => store.queryRecord('challenge', { assessmentId: assessment.get('id') }));
  },

  _userIsUnauthenticated() {
    return this.get('session.isAuthenticated') === false;
  },

  _thereIsNoAssessment(assessments) {
    return isEmpty(assessments);
  }

});
