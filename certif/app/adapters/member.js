import ApplicationAdapter from './application';
import { service } from '@ember/service';

export default class MemberAdapter extends ApplicationAdapter {
  @service currentUser;

  urlForQuery(query) {
    return `${this.host}/${this.namespace}/certification-centers/${query.certificationCenterId}/members`;
  }

  urlForUpdateRecord(id) {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/certification-center-memberships/${id}`;
  }

  urlForDeleteRecord(id) {
    return `${this.host}/${this.namespace}/certification-center-memberships/${id}`;
  }

  updateRecord(store, type, snapshot) {
    const payload = this.serialize(snapshot);
    const certificationCenterMembershipId = payload.data.attributes['certification-center-membership-id'];
    const url = this.buildURL(type.modelName, certificationCenterMembershipId, snapshot, 'updateRecord');
    return this.ajax(url, 'PATCH', { data: payload });
  }

  deleteRecord(store, type, snapshot) {
    const payload = this.serialize(snapshot);
    const certificationCenterMembershipId = payload.data.attributes['certification-center-membership-id'];
    const url = this.buildURL(type.modelName, certificationCenterMembershipId, snapshot, 'deleteRecord');
    return this.ajax(url, 'DELETE', { data: payload });
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
