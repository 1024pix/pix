import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';

export default class SessionsMassImportReportAdapter extends ApplicationAdapter {
  @service currentUser;

  buildURL(modelName, id, snapshot, requestType, query) {
    if (requestType === 'confirm-mass-import') {
      const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
      return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/sessions/confirm-for-mass-import`;
    } else {
      return super.buildURL(modelName, id, snapshot, requestType, query);
    }
  }
}
