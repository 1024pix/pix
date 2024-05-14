import { service } from '@ember/service';

import ApplicationAdapter from './application';

export default class SessionEnrolmentAdapter extends ApplicationAdapter {
  @service currentUser;

  pathForType(_) {
    return 'sessions';
  }

  urlForCreateRecord() {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/session`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions) {
      if (snapshot.adapterOptions.studentListToAdd.length) {
        const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/enrol-students-to-session';
        const organizationLearnerIds = snapshot.adapterOptions.studentListToAdd.map((student) => student.id);
        const data = {
          data: {
            attributes: {
              'organization-learner-ids': organizationLearnerIds,
            },
          },
        };

        return this.ajax(url, 'PUT', { data });
      }
    }

    return super.updateRecord(...arguments);
  }
}
