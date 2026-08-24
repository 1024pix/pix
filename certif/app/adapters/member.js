import { service } from '@ember/service';

import ApplicationAdapter from './application';

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

  updateReferer({ userId, isReferer }) {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    const payload = {
      data: {
        attributes: {
          userId,
          isReferer,
        },
      },
    };
    const url = `${this.host}/${this.namespace}/certif/certification-centers/${certificationCenterId}/update-referer`;

    return this.ajax(url, 'POST', { data: payload });
  }
}
