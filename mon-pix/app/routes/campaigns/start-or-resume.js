import BaseRoute from 'mon-pix/routes/base-route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';

export default BaseRoute.extend({

  campaignCode: null,
  campaign: null,
  session: service(),

  model(params) {

    const store = this.get('store');
    this.set('campaignCode', params.campaign_code);
    return store.query('campaign', { filter: { code: this.get('campaignCode') } })
      .then((campaigns) => {
        this.set('campaign', campaigns.get('firstObject'));
      })
      .then(() => {
        if (this.get('session').get('isAuthenticated')) {
          return this._retrieveOrCreateAssessements(this.get('campaignCode'));
        }
        return this.transitionTo('campaigns.campaign-landing-page', this.get('campaignCode'));
      })
      .catch(() => RSVP.reject());
  },

  _retrieveOrCreateAssessements(campaignCode) {
    const store = this.get('store');
    return store.query('assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: campaignCode } })
      .then((smartPlacementAssessments) => {
        if (!isEmpty(smartPlacementAssessments)) {
          return smartPlacementAssessments.get('firstObject')
        }
        return null;
      })
      .then((assessment) => {
        if(assessment) {
          this._startFirstChallenge(assessment);
        } else {
          this.transitionTo('campaigns.campaign-landing-page', this.get('campaignCode'));
        }
      });
  },

  _startFirstChallenge(assessment) {
    const store = this.get('store');
    return assessment.reload()
      .then(()=> store.queryRecord('challenge', { assessmentId: assessment.get('id') }))
      .then((challenge) => this.transitionTo('assessments.challenge', { assessment, challenge }));
  },
});
