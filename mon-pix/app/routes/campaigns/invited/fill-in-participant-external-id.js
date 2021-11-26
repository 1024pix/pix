import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class FillInParticipantExternalIdRoute extends Route.extend(SecuredRouteMixin) {
  @service campaignStorage;

  async model() {
    return this.modelFor('campaigns');
  }

  afterModel(campaign) {
    if (!this.shouldProvideExternalId(campaign)) {
      this.replaceWith('campaigns.entrance', campaign.code);
    }
  }

  shouldProvideExternalId(campaign) {
    const participantExternalId = this.campaignStorage.get(campaign.code, 'participantExternalId');
    return campaign.idPixLabel && !participantExternalId;
  }
}
