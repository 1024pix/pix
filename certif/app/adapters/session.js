import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';

export default class SessionAdapter extends ApplicationAdapter {
  @service currentUser;

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);
    if (adapterOptions && adapterOptions.finalization) {
      delete adapterOptions.finalization;
      return url + '/finalization';
    }

    return url;
  }

  urlForCreateRecord() {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/session`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions) {
      if (snapshot.adapterOptions.finalization) {
        const model = snapshot.record;
        const data = {
          data: {
            attributes: {
              'examiner-global-comment': model.examinerGlobalComment,
              'has-incident': model.hasIncident,
              'has-joining-issue': model.hasJoiningIssue,
            },
            included: model.certificationReports.map((certificationReport) => {
              return {
                type: 'certification-reports',
                id: certificationReport.get('id'),
                attributes: { ...certificationReport.toJSON() },
              };
            }),
          },
        };
        return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PUT', { data });
      }

      if (snapshot.adapterOptions.studentListToAdd) {
        const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/enroll-students-to-session';
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
