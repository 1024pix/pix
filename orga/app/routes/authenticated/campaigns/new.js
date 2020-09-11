import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class NewRoute extends Route {

  @service store;
  @service currentUser;

  model() {
    const organization = this.currentUser.organization;
    return RSVP.hash({
      campaign: this.store.createRecord('campaign', { organizationId: organization.id }),
      targetProfiles: organization.targetProfiles,
    });
  }
}
