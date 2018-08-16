import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default Route.extend({

  store: service(),
  currentOrganization: service(),

  model() {
    return this.currentOrganization.organization
      .then((organization) => {
        return RSVP.hash({
          campaign: this.get('store').createRecord('campaign', { organizationId: organization.get('id') }),
          targetProfiles: organization.get('targetProfiles')
        });
      });
  }
});
