import get from 'lodash/get';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EntryPoint extends Route {
  @service currentUser;
  @service campaignStorage;
  @service session;

  model() {
    return this.modelFor('campaigns');
  }

  afterModel(campaign) {
    this.campaignStorage.clear(campaign.code);
  }

  async redirect(campaign, transition) {
    const queryParams = transition.to.queryParams;
    if (queryParams.participantExternalId) {
      this.campaignStorage.set(campaign.code, 'participantExternalId', transition.to.queryParams.participantExternalId);
    }
    if (queryParams.retry) {
      this.campaignStorage.set(campaign.code, 'retry', transition.to.queryParams.retry);
    }

    let hasParticipated = false;
    if (this.session.isAuthenticated) {
      const currentUserId = get(this.currentUser, 'user.id', null);
      const ongoingCampaignParticipation = await this.store.queryRecord('campaignParticipation', {
        campaignId: campaign.id,
        userId: currentUserId,
      });
      hasParticipated = Boolean(ongoingCampaignParticipation);
      this.campaignStorage.set(campaign.code, 'hasParticipated', hasParticipated);
    }

    if (campaign.isArchived && !hasParticipated) {
      return this.replaceWith('campaigns.campaign-not-found', campaign);
    }

    if (hasParticipated) {
      return this.replaceWith('campaigns.entrance', campaign);
    }

    return this.replaceWith('campaigns.campaign-landing-page', campaign);
  }
}
