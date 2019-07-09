import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default Route.extend({

  store: service(),
  currentUser: service(),

  model() {
    const organization = this.currentUser.organization;
    return RSVP.hash({
      campaign: this.store.createRecord('campaign', { organizationId: organization.get('id') }),
      targetProfiles: organization.get('targetProfiles')
    });
  }
});
