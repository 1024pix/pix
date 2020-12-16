import ApplicationAdapter from './application';

export default class CertificationIssueReportAdapter extends ApplicationAdapter {
  urlForCreateRecord(modelName, snapshot) {
    const url = super.urlForCreateRecord(...arguments);
    const certificationReport = snapshot.belongsTo('certificationReport');
    const certificationCourseId = certificationReport.attr('certificationCourseId');
    if (certificationCourseId) {
      return `${this.host}/${this.namespace}/certification-reports/${certificationCourseId}/certification-issue-reports`;
    }
    return url;
  }
}
