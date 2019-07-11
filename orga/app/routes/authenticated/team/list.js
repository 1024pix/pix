import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  currentUser: service(),

  beforeModel() {
    this._super(...arguments);
    if (!this.currentUser.isOwnerInOrganization) {
      return this.replaceWith('application');
    }
  },

  model() {
    return this.currentUser.organization;
  },
});
