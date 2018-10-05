import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import BaseRoute from 'mon-pix/routes/base-route';
import RSVP from 'rsvp';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  model(params) {
    const campaignCode = params.campaign_code;
    const store = this.get('store');
    return store.query('campaign', { filter: { code: campaignCode } })
      .then((campaigns) => campaigns.get('firstObject'))
      .then((campaign) => {
        if(campaign.get('idPixLabel') == null) { // we want to handle null or undefined
          return this.start(campaign, campaignCode);
        }
        return { campaign , idPixLabel: campaign.get('idPixLabel'), campaignCode };
      })
      .catch(() => RSVP.reject());
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('start', (campaign, campaignCode, participantExternalId) => this.start(campaign, campaignCode, participantExternalId));
  },

  start(campaign, participantExternalId) {
    return this._createCampaignParticipation(campaign, participantExternalId)
      .then((assessment) => this._startFirstChallenge(assessment));
  },

  _createCampaignParticipation(campaign, participantExternalId) {
    const store = this.get('store');
    return store.createRecord('campaign-participation', { campaign, participantExternalId })
      .save()
      .then((campaignParticipation) => campaignParticipation.get('assessment'));
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
