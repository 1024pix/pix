import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import _ from 'lodash';

export default Route.extend({
  campaignCode: null,
  session: service(),

  beforeModel(transition) {
    this.set('campaignCode',transition.to.params.campaign_code);
    const store = this.store;
    return store.query('assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: this.campaignCode } })
      .then((smartPlacementAssessments) => {
        if (!isEmpty(smartPlacementAssessments)) {
          return this.transitionTo('campaigns.start-or-resume', this.campaignCode);
        }
      });
  },

  model(params) {
    this.set('campaignCode', params.campaign_code);

    const store = this.store;
    return store.query('campaign', { filter: { code: this.campaignCode } })
      .then((campaigns) => campaigns.get('firstObject'))
      .then((campaign) => {
        if (!campaign.get('idPixLabel')) {
          return this.start(campaign);
        }
        return { campaign , idPixLabel: campaign.get('idPixLabel'), campaignCode: this.campaignCode };
      });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('start', (campaign, participantExternalId) => this.start(campaign, participantExternalId));
  },

  start(campaign, participantExternalId = null) {
    const store = this.store;
    return store.createRecord('campaign-participation', { campaign, participantExternalId })
      .save()
      .catch((err) => {
        if (_.get(err, 'errors[0].status') === 403) {
          return this.session.invalidate();
        }
        return this.send('error');
      })
      .then(() => {
        return this.transitionTo('campaigns.start-or-resume', this.campaignCode);
      });
  },
}, AuthenticatedRouteMixin);
