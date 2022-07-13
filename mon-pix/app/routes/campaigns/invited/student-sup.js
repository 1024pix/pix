import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class StudentSupRoute extends Route {
  @service currentUser;
  @service campaignStorage;
  @service store;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign) {
    const schoolingRegistration = await this.store.queryRecord('schooling-registration-user-association', {
      userId: this.currentUser.user.id,
      campaignCode: campaign.code,
    });

    if (schoolingRegistration) {
      this.campaignStorage.set(campaign.code, 'associationDone', true);
      this.router.replaceWith('campaigns.invited.fill-in-participant-external-id', campaign.code);
    }
  }
}
