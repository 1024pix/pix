import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import BaseRoute from 'mon-pix/routes/base-route';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  model(params) {
    const campaignCode = params.campaign_code;
    const store = this.get('store');
    return store.query('campaign', { filter: { code: campaignCode } })
      .then((campaigns) => campaigns.get('firstObject'))
      .then((campaign) => {
        if(campaign.get('idPixLabel') == null) { // we want to handle null or undefined
          return this._start(campaignCode);
        }
        return campaign;
      })
      .catch(() => RSVP.reject());
  },

  actions: {
    submit(campaignCode) {
      return this._start(campaignCode);
    },
  },

  _start(campaignCode) {
    return this._retrieveOrCreateAssessements(campaignCode)
      .then((assessment) => this._startFirstChallenge(assessment));
  },

  _retrieveOrCreateAssessements(campaignCode) {
    const store = this.get('store');
    return store.query('assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: campaignCode } })
      .then((smartPlacementAssessments) => {
        if (!isEmpty(smartPlacementAssessments)) {
          return smartPlacementAssessments.get('firstObject');
        }
        return store.createRecord('assessment', { type: 'SMART_PLACEMENT', codeCampaign: campaignCode }).save();
      });
  },

  _startFirstChallenge(assessment) {
    const store = this.get('store');
    return assessment.reload()
      .then(() => store.queryRecord('challenge', { assessmentId: assessment.get('id') }))
      .then((challenge) => this.transitionTo('assessments.challenge', { assessment, challenge }));
  }
});
