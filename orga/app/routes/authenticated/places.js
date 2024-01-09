import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedPlacesRoute extends Route {
  @service currentUser;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentUser.shouldAccessPlacesPage) {
      this.router.replaceWith('application');
    }
  }

  async model() {
    try {
      return await this.store.queryRecord('organization-place-statistic', {
        organizationId: this.currentUser.organization.id,
      });
    } catch (_) {
      this.router.replaceWith('application');
    }
  }
}
