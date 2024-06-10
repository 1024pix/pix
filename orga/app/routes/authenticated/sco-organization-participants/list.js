import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class ListRoute extends Route {
  queryParams = {
    search: { refreshModel: true },
    divisions: { refreshModel: true },
    connectionTypes: { refreshModel: true },
    certificability: { refreshModel: true },
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    participationCountOrder: { refreshModel: true },
    lastnameSort: { refreshModel: true },
    divisionSort: { refreshModel: true },
  };

  @service currentUser;
  @service store;

  async model(params) {
    const organizationId = this.currentUser.organization.id;
    return RSVP.hash({
      importDetail: this.currentUser.canAccessImportPage
        ? await this.store.queryRecord('organization-import-detail', {
            organizationId: this.currentUser.organization.id,
          })
        : null,
      participants: this.store.query('sco-organization-participant', {
        filter: {
          organizationId,
          search: params.search,
          divisions: params.divisions,
          connectionTypes: params.connectionTypes,
          certificability: params.certificability,
        },
        sort: {
          participationCount: params.participationCountOrder,
          lastnameSort: params.lastnameSort,
          divisionSort: params.divisionSort,
        },
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      }),
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.search = null;
      controller.divisions = [];
      controller.connectionTypes = [];
      controller.certificability = [];
      controller.pageNumber = null;
      controller.pageSize = 50;
      controller.participationCountOrder = null;
      controller.lastnameSort = 'asc';
      controller.divisionSort = null;
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
