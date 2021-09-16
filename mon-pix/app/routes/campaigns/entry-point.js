import get from 'lodash/get';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EntryPoint extends Route {
  @service currentUser;
  @service campaignStorage;

  async model() {
    return this.modelFor('campaigns');
  }

  async redirect(campaign, transition) {
    const participantExternalId = transition.to.queryParams.participantExternalId;
    if (participantExternalId) {
      this.campaignStorage.set(campaign.code, 'participantExternalId', transition.to.queryParams.participantExternalId);
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

    return this.replaceWith('campaigns.start-or-resume', campaign);
  }
}
