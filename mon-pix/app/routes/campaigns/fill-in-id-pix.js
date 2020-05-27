import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';
import _ from 'lodash';

export default class FillInIdPixRoute extends Route.extend(SecuredRouteMixin) {
  @service session;
  @service currentUser;

  participantExternalId = null;

  deactivate() {
    this.controller.set('participantExternalId', null);
    this.controller.set('isLoading', false);
  }

  async beforeModel(transition) {
    this.participantExternalId = transition.to.queryParams && transition.to.queryParams.participantExternalId;
  }

  async model() {
    const campaignCode = this.paramsFor('campaigns').campaign_code;
    const campaigns = await this.store.query('campaign', { filter: { code: campaignCode } });
    return campaigns.get('firstObject');
  }

  async afterModel(campaign) {
    const userId = this.currentUser.user.id;
    const campaignParticipation = await this.store.queryRecord('campaignParticipation', { campaignId: campaign.id, userId });

    if (campaignParticipation) {
      return this.replaceWith('campaigns.start-or-resume', campaign.code);
    }

    if (!campaign.idPixLabel) {
      return this.start(campaign);
    }

    if (this.participantExternalId) {
      return this.start(campaign, this.participantExternalId);
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('start', (campaign, participantExternalId) => this.start(campaign, participantExternalId));
  }

  async start(campaign, participantExternalId = null) {
    try {
      await this.store.createRecord('campaign-participation', { campaign, participantExternalId }).save();
      this.transitionTo('campaigns.start-or-resume', campaign.code);
    } catch (err) {
      if (_.get(err, 'errors[0].status') === 403) {
        this.session.invalidate();
        return this.transitionTo('campaigns.start-or-resume', campaign.code);
      }
      return this.send('error', err, this.transitionTo('campaigns.start-or-resume', campaign.code));
    }
  }
}
