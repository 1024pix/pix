import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ImportRoute extends Route {
  @service currentUser;
  @service router;

  beforeModel() {
    super.beforeModel(...arguments);
    if (!this.currentUser.isAdminInOrganization) {
      return this.router.replaceWith('application');
    }
  }
}
