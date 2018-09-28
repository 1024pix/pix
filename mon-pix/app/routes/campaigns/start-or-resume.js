import BaseRoute from 'mon-pix/routes/base-route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default BaseRoute.extend({

  session: service(),
  campaignCode: null,
  campaign: null,

  model(params) {
    const store = this.get('store');
    this.set('campaignCode', params.campaign_code);

    return store.query('campaign', { filter: { code: this.get('campaignCode') } })
      .then((campaigns) => {
        return this.set('campaign', campaigns.get('firstObject'));
      });
  },

  afterModel() {
    const store = this.get('store');

    if (this._userIsUnauthenticated()) {
      return this.transitionTo('campaigns.campaign-landing-page', this.get('campaignCode'));
    }

    return store.query('assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: this.get('campaignCode') } })
      .then((smartPlacementAssessments) => {

        if (this._thereIsNoAssessment(smartPlacementAssessments)) {
          return this.transitionTo('campaigns.campaign-landing-page', this.get('campaignCode'));
        }

        const assessmentToContinue = smartPlacementAssessments.get('firstObject');
        return this._fetchChallenge(assessmentToContinue)
          .then((challenge) => {
            if(challenge) {
              return this.transitionTo('assessments.challenge', { assessment: assessmentToContinue, challenge });
            } else {
              return this.transitionTo('assessments.rating', assessmentToContinue.get('id'));
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
