import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { FINALIZED } from 'pix-admin/models/session';

export default Route.extend(AuthenticatedRouteMixin, {
  queryParams: {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    certificationCenterName: { refreshModel: true },
    status: { refreshModel: true },
    resultsSentToPrescriberAt: { refreshModel: true },
  },

  async model(params) {
    let sessions;
    try {
      sessions = await this.store.query('session', {
        filter: {
          id: params.id && params.id.trim(),
          certificationCenterName: params.certificationCenterName && params.certificationCenterName.trim(),
          status: params.status && params.status.trim(),
          resultsSentToPrescriberAt: params.resultsSentToPrescriberAt && params.resultsSentToPrescriberAt.trim(),
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
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
      controller.id = null;
      controller.certificationCenterName = null;
      controller.status = FINALIZED;
      controller.resultsSentToPrescriberAt = null;
    }
  }
});
