import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FillInParticipantExternalIdRoute extends Route {
  @service campaignStorage;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    return this.modelFor('campaigns');
  }

  afterModel(campaign) {
    if (!this.shouldProvideExternalId(campaign)) {
      this.router.replaceWith('campaigns.entrance', campaign.code);
    }
  }

  shouldProvideExternalId(campaign) {
    const participantExternalId = this.campaignStorage.get(campaign.code, 'participantExternalId');
    return campaign.idPixLabel && !participantExternalId;
  }
}
