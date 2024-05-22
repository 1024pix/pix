import { service } from '@ember/service';

import ApplicationAdapter from './application';

export default class SessionManagementAdapter extends ApplicationAdapter {
  @service currentUser;

  pathForType(_) {
    return 'sessions';
  }

  urlForFindRecord(_) {
    return `${super.urlForFindRecord(...arguments)}/management`;
  }

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);
    if (adapterOptions && adapterOptions.finalization) {
      delete adapterOptions.finalization;
      return url + '/finalization';
    }

    return url;
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
            included: model
              .hasMany('certificationReports')
              .value()
              .map((certificationReport) => {
                return {
                  type: 'certification-reports',
                  id: certificationReport.get('id'),
                  attributes: certificationReport.toJSON(),
                };
              }),
          },
        };
        return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PUT', { data });
      }
    }

    return super.updateRecord(...arguments);
  }

  dismissLiveAlert(sessionId, candidateId) {
    const url = `${this.host}/${this.namespace}/sessions/${sessionId}/candidates/${candidateId}/dismiss-live-alert`;
    return this.ajax(url, 'PATCH');
  }

  validateLiveAlert({ sessionId, candidateId, subcategory }) {
    const url = `${this.host}/${this.namespace}/sessions/${sessionId}/candidates/${candidateId}/validate-live-alert`;
    return this.ajax(url, 'PATCH', {
      data: {
        subcategory,
      },
    });
  }
}
