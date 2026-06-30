import ApplicationAdapter from './application';

export default class CertificationIssueReportAdapter extends ApplicationAdapter {
  namespace = 'api';

  urlForUpdateRecord(certificationIssueReportId) {
    return `${this.host}/${this.namespace}/certification-issue-reports/${certificationIssueReportId}`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions.resolutionLabel) {
      const payload = {
        data: {
          resolution: snapshot.adapterOptions.resolutionLabel,
        },
      };

      return this.ajax(this.urlForUpdateRecord(snapshot.id), 'PATCH', { data: payload });
    }
  }
}
