import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class TeamRoute extends Route {
  @service currentUser;

  beforeModel() {
    super.beforeModel(...arguments);
    if (!this.currentUser.isAdminInOrganization) {
      return this.replaceWith('application');
    }
  }
}
