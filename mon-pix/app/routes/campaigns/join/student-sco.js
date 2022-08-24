import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StudentScoRoute extends Route {
  @service campaignStorage;
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }

  async model() {
    return this.modelFor('campaigns');
  }

  setupController(controller, campaign) {
    controller.displayRegisterForm = !this.campaignStorage.get(campaign.code, 'hasUserSeenJoinPage');
  }
}
