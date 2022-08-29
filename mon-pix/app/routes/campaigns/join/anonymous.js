import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AnonymousRoute extends Route {
  @service session;
  @service currentUser;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign) {
    await this.session.authenticate('authenticator:anonymous', { campaignCode: campaign.code });
    await this.currentUser.load();
  }
}
