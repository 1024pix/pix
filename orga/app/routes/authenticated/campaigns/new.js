import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default Route.extend({

  store: service(),
  currentOrganization: service(),

  async model() {
    const organization = await this.currentOrganization.organization;

    return RSVP.hash({
      campaign: this.store.createRecord('campaign', { organizationId: organization.get('id') }),
      targetProfiles: organization.get('targetProfiles'),
    });
  }
});
