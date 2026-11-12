import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class Credits extends Route {
  @service router;

  async model() {
    return await this.modelFor('authenticated.organizations.get');
  }

  afterModel(organization) {
    if (!organization.isCreditsManagementEnabled) {
      this.router.replaceWith('authenticated.organizations.get.team');
    }
  }
}
