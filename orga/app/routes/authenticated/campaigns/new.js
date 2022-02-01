import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class NewRoute extends Route {
  @service store;
  @service currentUser;

  async model(params) {
    const organization = this.currentUser.organization;

    const memberships = await this.store.query('membership', {
      filter: {
        organizationId: organization.id,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
    const members = memberships.map((membership) => membership.user);
    const membersSortedByFullName = members.sortBy('firstName', 'lastName');

    return RSVP.hash({
      campaign: this.store.createRecord('campaign', { organizationId: organization.id }),
      targetProfiles: organization.targetProfiles,
      membersSortedByFullName,
    });
  }
}
