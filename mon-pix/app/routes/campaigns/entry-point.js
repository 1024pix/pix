import get from 'lodash/get';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EntryPoint extends Route {
  @service currentUser;
  @service campaignStorage;

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

    const currentUserId = get(this.currentUser, 'user.id', null);
    let ongoingCampaignParticipation = null;

    if (currentUserId) {
      ongoingCampaignParticipation = await this.store.queryRecord('campaignParticipation', {
        campaignId: campaign.id,
        userId: currentUserId,
      });
    }

    if (campaign.isArchived && !ongoingCampaignParticipation) {
      return this.replaceWith('campaigns.campaign-not-found', campaign);
    }

    return this.replaceWith('campaigns.campaign-landing-page', campaign);
  }
}
