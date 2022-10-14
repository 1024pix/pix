import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';

export default class MemberAdapter extends ApplicationAdapter {
  @service currentUser;

  urlForQuery(query) {
    return `${this.host}/${this.namespace}/certification-centers/${query.certificationCenterId}/members`;
  }

  buildURL(modelName, id, snapshot, requestType, query) {
    if (requestType === 'update-referer') {
      const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;

      return `${this.host}/${this.namespace}/certif/certification-centers/${certificationCenterId}/update-referer`;
    } else {
      return super.buildURL(modelName, id, snapshot, requestType, query);
    }
  }
}
