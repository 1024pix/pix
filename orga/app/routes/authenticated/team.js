import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  currentUser: service(),

  beforeModel() {
    this._super(...arguments);
    if (!this.currentUser.isAdminInOrganization) {
      return this.replaceWith('application');
    }
  },
});
