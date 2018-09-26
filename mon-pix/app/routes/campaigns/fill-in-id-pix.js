import BaseRoute from 'mon-pix/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { isEmpty } from '@ember/utils';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  model(params) {
    return params.campaign_code;
  },

  afterModel(campaignCode) {
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
