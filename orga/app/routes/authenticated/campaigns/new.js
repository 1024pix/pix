import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class NewRoute extends Route {
  @service store;
  @service currentUser;

  async model() {
    const organization = this.currentUser.organization;
    const members = await this.store.findAll('member', { adapterOptions: { organizationId: organization.id } });
    const membersSortedByFullName = members.sortBy('firstName', 'lastName');

    return RSVP.hash({
      campaign: this.store.createRecord('campaign', { organizationId: organization.id }),
      targetProfiles: organization.targetProfiles,
      membersSortedByFullName,
    });
  }
}
