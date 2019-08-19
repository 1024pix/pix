import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import _ from 'lodash';

export default Route.extend({

  session: service(),

  async beforeModel(transition) {
    const campaignCode = transition.to.params.campaign_code;

    const assessments = await this.store.query('assessment', { filter: { codeCampaign: campaignCode } });

    if (!isEmpty(assessments)) {
      return this.transitionTo('campaigns.start-or-resume', campaignCode);
    }
  },

  async model(params) {
    const campaigns = await this.store.query('campaign', { filter: { code: params.campaign_code } });

    return campaigns.get('firstObject');
  },

  afterModel(campaign) {
    if (!campaign.idPixLabel) {
      return this.start(campaign);
    }
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('start', (campaign, participantExternalId) => this.start(campaign, participantExternalId));
  },

  start(campaign, participantExternalId = null) {
    return this.store.createRecord('campaign-participation', { campaign, participantExternalId })
      .save()
      .catch((err) => {
        if (_.get(err, 'errors[0].status') === 403) {
          return this.session.invalidate();
        }
        return this.send('error');
      })
      .then(() => {
        return this.transitionTo('campaigns.start-or-resume', campaign.code);
      });
  },
}, AuthenticatedRouteMixin);
