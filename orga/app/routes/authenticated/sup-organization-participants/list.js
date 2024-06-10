import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class ListRoute extends Route {
  queryParams = {
    search: { refreshModel: true },
    studentNumber: { refreshModel: true },
    groups: { refreshModel: true },
    certificability: { refreshModel: true },
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    participationCountOrder: { refreshModel: true },
    lastnameSort: { refreshModel: true },
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
      participants: this.store.query('sup-organization-participant', {
        filter: {
          organizationId,
          search: params.search,
          studentNumber: params.studentNumber,
          groups: params.groups,
          certificability: params.certificability,
        },
        sort: {
          participationCount: params.participationCountOrder,
          lastnameSort: params.lastnameSort,
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
      controller.studentNumber = null;
      controller.groups = [];
      controller.certificability = [];
      controller.pageNumber = null;
      controller.pageSize = 50;
      controller.participationCountOrder = null;
      controller.lastnameSort = 'asc';
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
