import { service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class NewRoute extends Route {
  @service store;
  @service currentUser;

  async model() {
    const organization = this.currentUser.organization;
    const membersSortedByFullName = await this.store.findAll('member-identity', {
      adapterOptions: { organizationId: organization.id },
    });

    return RSVP.hash({
      campaign: this.store.createRecord('campaign', { organizationId: organization.id }),
      targetProfiles: organization.targetProfiles,
      membersSortedByFullName,
    });
  }
}
