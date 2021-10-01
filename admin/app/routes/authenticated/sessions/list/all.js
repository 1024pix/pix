import Route from '@ember/routing/route';
import { FINALIZED } from 'pix-admin/models/session';
import trim from 'lodash/trim';

export default class AuthenticatedSessionsAllRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    certificationCenterName: { refreshModel: true },
    certificationCenterExternalId: { refreshModel: true },
    certificationCenterType: { refreshModel: true },
    status: { refreshModel: true },
    resultsSentToPrescriberAt: { refreshModel: true },
  };

  async model(params) {
    let sessions;
    try {
      sessions = await this.store.query('session', {
        filter: {
          id: trim(params.id) || undefined,
          certificationCenterName: trim(params.certificationCenterName) || undefined,
          certificationCenterExternalId: trim(params.certificationCenterExternalId) || undefined,
          certificationCenterType: params.certificationCenterType || undefined,
          status: params.status || undefined,
          resultsSentToPrescriberAt: params.resultsSentToPrescriberAt || undefined,
        },
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      });
    } catch (err) {
      return [];
    }

    return sessions;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
      controller.id = null;
      controller.certificationCenterName = null;
      controller.certificationCenterExternalId = null;
      controller.certificationCenterType = null;
      controller.status = FINALIZED;
      controller.resultsSentToPrescriberAt = null;
    }
  }
}
