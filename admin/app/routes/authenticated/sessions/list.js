import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { FINALIZED } from 'pix-admin/models/session';
import { trim } from 'lodash';

export default Route.extend(AuthenticatedRouteMixin, {
  queryParams: {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    certificationCenterName: { refreshModel: true },
    status: { refreshModel: true },
    resultsSentToPrescriberAt: { refreshModel: true },
    assignedToSelfOnly: { refreshModel: true },
  },

  async model(params) {
    let sessions;
    try {
      sessions = await this.store.query('session', {
        filter: {
          id: trim(params.id) || undefined,
          certificationCenterName: trim(params.certificationCenterName) || undefined,
          status: params.status || undefined,
          resultsSentToPrescriberAt: params.resultsSentToPrescriberAt || undefined,
          assignedToSelfOnly: params.assignedToSelfOnly,
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
      controller.assignedToSelfOnly = false;
    }
  }
});
