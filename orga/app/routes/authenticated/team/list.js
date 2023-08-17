import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class ListRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  @service currentUser;
  @service store;

  async model(params) {
    const organization = this.currentUser.organization;
    const memberships = this.store.query('membership', {
      filter: {
        organizationId: organization.id,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });

    return RSVP.hash({
      memberships,
      organization,
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
