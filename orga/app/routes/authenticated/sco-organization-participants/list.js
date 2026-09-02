import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

import paramsValidator from '../../../utils/params-validator';

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
    latestParticipationSort: { refreshModel: true },
  };

  @service currentUser;
  @service store;

  async model(params) {
    paramsValidator.validateCertificabilityParams(params);

    const organizationId = this.currentUser.organization.id;
    const participants = await this.store.query('sco-organization-participant', {
      filter: {
        organizationId,
        search: params.search,
        divisions: params.divisions,
        connectionTypes: params.connectionTypes,
        certificability: params.certificability,
      },
      sort: {
        participationCount: params.participationCountOrder,
        latestParticipationSort: params.latestParticipationSort,
        lastnameSort: params.lastnameSort,
        divisionSort: params.divisionSort,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });

    const importDetail = this.currentUser.canAccessImportPage
      ? await this.store.queryRecord('organization-import-detail', {
          organizationId: this.currentUser.organization.id,
        })
      : null;

    return {
      importDetail,
      participants,
    };
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
      controller.latestParticipationOrder = null;
      controller.lastnameSort = 'asc';
      controller.divisionSort = null;
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
