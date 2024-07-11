import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class AuthenticatedCampaignsListAllCampaignsRoute extends Route {
  queryParams = {
    pageNumber: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
    name: {
      refreshModel: true,
    },
    status: {
      refreshModel: true,
    },
    ownerName: {
      refreshModel: true,
    },
  };

  @service store;
  @service currentUser;
  @service router;

  beforeModel() {
    if (!this.currentUser.canAccessCampaignsPage) {
      return this.router.replaceWith(this.currentUser.homePage);
    }
  }

  model(params) {
    return RSVP.hash({
      isAdmin: this.currentUser.isAdminInOrganization,
      organizationId: this.currentUser.organization.id,
      campaigns: this.store.query(
        'campaign',
        {
          filter: {
            organizationId: this.currentUser.organization.id,
            name: params.name,
            status: params.status,
            ownerName: params.ownerName,
          },
          page: {
            number: params.pageNumber,
            size: params.pageSize,
          },
        },
        { reload: true },
      ),
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 50;
      controller.name = null;
      controller.ownerName = null;
      controller.status = null;
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
