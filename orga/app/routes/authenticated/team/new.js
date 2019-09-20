import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default Route.extend({

  store: service(),
  currentUser: service(),

  model() {
    const organization = this.currentUser.organization;
    return RSVP.hash({
      organization,
      organizationInvitation: this.store.createRecord('organizationInvitation', { organizationId: organization.id })
    });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('errorMessage', null);
  },
});
