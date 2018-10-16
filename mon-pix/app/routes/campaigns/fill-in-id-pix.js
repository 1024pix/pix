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
          return this.start(campaign, campaignCode);
        }
        return { campaign , idPixLabel: campaign.get('idPixLabel'), campaignCode };
      })
      .catch(() => RSVP.reject());
  },

  afterModel(model) {
    return this._existAssessment(model.campaignCode)
      .then((assessment) => {
        if(assessment) {
          return this._startFirstChallenge(assessment);
        }
      });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('start', (campaign, campaignCode, participantExternalId) => this.start(campaign, campaignCode, participantExternalId));
  },

  start(campaign, campaignCode, participantExternalId) {
    return this._retrieveOrCreateCampaignParticipation(campaign, campaignCode, participantExternalId)
      .then((assessment) => this._startFirstChallenge(assessment));
  },

  _existAssessment(campaignCode) {
    const store = this.get('store');
    // TODO query campaign-participation instead of assessment
    return store.query('assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: campaignCode } })
      .then((smartPlacementAssessments) => {
        if (!isEmpty(smartPlacementAssessments)) {
          return smartPlacementAssessments.get('firstObject');
        }
        return null;
      });
  },

  _retrieveOrCreateCampaignParticipation(campaign, campaignCode, participantExternalId) {
    const store = this.get('store');
    // TODO query campaign-participation instead of assessment
    return store.query('assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: campaignCode } })
      .then((smartPlacementAssessments) => {
        if (!isEmpty(smartPlacementAssessments)) {
          return smartPlacementAssessments.get('firstObject');
        }
        return store.createRecord('campaign-participation', { campaign, participantExternalId })
          .save()
          .then((campaignParticipation) => campaignParticipation.get('assessment'));
      });
  },

  _startFirstChallenge(assessment) {
    const store = this.get('store');
    return assessment.reload()
      .then(() => store.queryRecord('challenge', { assessmentId: assessment.get('id') }))
      .then((challenge) => {
        if(challenge) {
          return this.transitionTo('assessments.challenge', { assessment, challenge });
        } else {
          return this.transitionTo('assessments.rating', assessment.get('id'));
        }
      });
  },
});
