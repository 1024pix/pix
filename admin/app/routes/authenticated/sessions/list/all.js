import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedSessionsAllRoute extends Route {
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    ids: { refreshModel: true },
    certificationCenterName: { refreshModel: true },
    certificationCenterExternalId: { refreshModel: true },
    certificationCenterType: { refreshModel: true },
    status: { refreshModel: true },
    version: { refreshModel: true },
  };

  async model(params) {
    const ids = params.ids
      ?.split(',')
      .map((id) => id.trim())
      .filter((id) => /^\d+$/.test(id));

    let sessions;
    try {
      sessions = await this.store.query('session', {
        filter: {
          ids: ids?.length ? ids : undefined,
          certificationCenterName: params.certificationCenterName?.trim() || undefined,
          certificationCenterExternalId: params.certificationCenterExternalId?.trim() || undefined,
          certificationCenterType: params.certificationCenterType || undefined,
          status: params.status || undefined,
          version: params.version || undefined,
        },
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      });
    } catch {
      return [];
    }

    return sessions;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 100;
      controller.ids = null;
      controller.certificationCenterName = null;
      controller.certificationCenterExternalId = null;
      controller.certificationCenterType = null;
      controller.status = null;
      controller.version = null;
    }
  }
}
