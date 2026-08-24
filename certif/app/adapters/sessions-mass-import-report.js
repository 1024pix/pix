import { service } from '@ember/service';

import ApplicationAdapter from './application';

export default class SessionsMassImportReportAdapter extends ApplicationAdapter {
  @service currentUser;

  confirm({ cachedValidatedSessionsKey }) {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    const payload = {
      data: {
        attributes: {
          cachedValidatedSessionsKey,
        },
      },
    };
    return this.ajax(
      `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/sessions/confirm-for-mass-import`,
      'POST',
      {
        data: payload,
      },
    );
  }
}
