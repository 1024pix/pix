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

  updateRecord(store, type, snapshot) {
    const payload = this.serialize(snapshot);
    const certificationCenterMembershipId = payload.data.attributes['certification-center-membership-id'];
    const url = this.buildURL(type.modelName, certificationCenterMembershipId, snapshot, 'updateRecord');
    return this.ajax(url, 'PATCH', { data: payload });
  }

  buildURL(modelName, id, snapshot, requestType, query) {
    if (requestType === 'update-referer') {
      const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;

      return `${this.host}/${this.namespace}/certif/certification-centers/${certificationCenterId}/update-referer`;
    } else {
      return super.buildURL(modelName, id, snapshot, requestType, query);
    }
  }

  async leaveCertificationCenter(certificationCenterId) {
    const url = `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/members/me/disable`;
    return this.ajax(url, 'POST', { data: { certificationCenterId } });
  }
}
