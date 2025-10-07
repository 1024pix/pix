import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class StudentScoRoute extends Route {
  @service accessStorage;
  @service session;
  @service router;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }

  async model() {
    const { organizationToJoin } = this.modelFor('organizations');
    const redirectionUrl = this.session.redirectionUrl;
    return {
      organizationToJoin,
      redirectionUrl,
    };
  }

  setupController(controller, model) {
    controller.displayScoSignupForm = !this.accessStorage.hasUserSeenJoinPage(model.organizationToJoin.id);
  }
}
