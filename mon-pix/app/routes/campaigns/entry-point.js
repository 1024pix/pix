import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class EntryPoint extends Route {
  @service currentUser;
  @service campaignStorage;
  @service session;
  @service router;
  @service store;
  @service metrics;

  async beforeModel() {
    if (this.session.isAuthenticated && this.currentUser.user.isAnonymous) {
      await this.session.invalidate();
    }
  }

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign, transition) {
    this.campaignStorage.clear(campaign.code);

    const queryParams = transition.to.queryParams;
    if (queryParams.participantExternalId) {
      this.campaignStorage.set(campaign.code, 'participantExternalId', transition.to.queryParams.participantExternalId);
    }
    if (queryParams.retry) {
      this.metrics.add({
        event: 'custom-event',
        'pix-event-category': 'Campagnes',
        'pix-event-action': 'Retenter la campagne',
        'pix-event-name': 'Clic sur Retenter la campagne',
      });
      this.campaignStorage.set(campaign.code, 'retry', transition.to.queryParams.retry);
    }
    if (queryParams.reset) {
      this.metrics.add({
        event: 'custom-event',
        'pix-event-category': 'Campagnes',
        'pix-event-action': 'Remise à zéro de la campagne',
        'pix-event-name': 'Clic sur Remise à zéro de la campagne',
      });
      this.campaignStorage.set(campaign.code, 'reset', transition.to.queryParams.reset);
    }

    let hasParticipated = false;
    if (this.session.isAuthenticated) {
      const currentUserId = this.currentUser.user.id;
      const ongoingCampaignParticipation = await this.store.queryRecord('campaignParticipation', {
        campaignId: campaign.id,
        userId: currentUserId,
      });
      hasParticipated = Boolean(ongoingCampaignParticipation);
      this.campaignStorage.set(campaign.code, 'hasParticipated', hasParticipated);
    }

    if (campaign.isArchived && !hasParticipated) {
      this.router.replaceWith('campaigns.archived-error', campaign.code);
    } else if (hasParticipated) {
      this.router.replaceWith('campaigns.entrance', campaign.code);
    } else {
      this.router.replaceWith('campaigns.campaign-landing-page', campaign.code);
    }
  }
}
