import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import BaseRoute from 'mon-pix/routes/base-route';
import { isEmpty } from '@ember/utils';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  beforeModel(transition) {
    const campaignCode = transition.params['campaigns.fill-in-id-pix'].campaign_code;
    const store = this.get('store');
    return store.query('assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: campaignCode } })
      .then((smartPlacementAssessments) => {
        if (!isEmpty(smartPlacementAssessments)) {
          return this.transitionTo('campaigns.start-or-resume', campaignCode);
        }
      });
  },

  model(params) {
    const campaignCode = params.campaign_code;
    const store = this.get('store');
    return store.query('campaign', { filter: { code: campaignCode } })
      .then((campaigns) => campaigns.get('firstObject'))
      .then((campaign) => {
        if (!campaign.get('idPixLabel')) {
          return this.start(campaign);
        }
        return { campaign , idPixLabel: campaign.get('idPixLabel'), campaignCode };
      });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('start', (campaign, participantExternalId) => this.start(campaign, participantExternalId));
  },

  start(campaign, participantExternalId = null) {
    return this._createCampaignParticipation(campaign, participantExternalId)
      .then((campaignParticipation) => campaignParticipation.get('assessment'))
      .then((assessment) => this._startFirstChallenge(assessment));
  },

  _createCampaignParticipation(campaign, participantExternalId) {
    const store = this.get('store');
    return store.createRecord('campaign-participation', { campaign, participantExternalId })
      .save();
  },

  _startFirstChallenge(assessment) {
    const store = this.get('store');
    return assessment.reload()
      .then(() => store.queryRecord('challenge', { assessmentId: assessment.get('id') }))
      .then((challenge) => {
        if(challenge) {
          return this.transitionTo('assessments.challenge', { assessment, challenge });
        } else {
          return this.transitionTo('campaigns.start-or-resume', this.get('campaignCode'));
        }
      });
  },
});
