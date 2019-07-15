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
      membership: this.store.createRecord('membership', { organizationId: organization.get('id'), organizationRole: 'MEMBER' })
    });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('email', null);
    controller.set('errorMessage', null);
  },
});
