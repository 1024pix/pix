import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import extraFilters from '../../../utils/extra-filter-serializer.js';
import paramsValidator from '../../../utils/params-validator.js';
export default class ListRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    extraFilters: { refreshModel: true },
    fullName: { refreshModel: true },
    certificability: { refreshModel: true },
    participationCountOrder: { refreshModel: true },
    latestParticipationOrder: { refreshModel: true },
    lastnameSort: { refreshModel: true },
  };

  @service currentUser;
  @service store;

  async model(params) {
    paramsValidator.validateCertificabilityParams(params);

    return this.store.query('organization-participant', {
      filter: {
        organizationId: this.currentUser.organization.id,
        fullName: params.fullName,
        certificability: params.certificability,
        extra: extraFilters.decodeExtraFilters(params.extraFilters),
      },
      sort: {
        participationCount: params.participationCountOrder,
        latestParticipationOrder: params.latestParticipationOrder,
        lastnameSort: params.lastnameSort,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 50;
      controller.fullName = null;
      controller.certificability = [];
      controller.extraFilters = extraFilters.encodeExtraFilters({});
      controller.participationCountOrder = null;
      controller.latestParticipationOrder = null;
      controller.lastnameSort = 'asc';
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
