import Model, { attr, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class CertificationReport extends Model {
  @attr('number') certificationCourseId;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') examinerComment; // todo: remove ?
  @attr('boolean') hasSeenEndTestScreen;

  @hasMany('certification-issue-report') certificationIssueReports;

  @computed('certificationIssueReports.@each.description')
  get firstIssueReportDescription() {
    const firstIssueReport = this.certificationIssueReports.firstObject;
    return firstIssueReport ? firstIssueReport.description : '';
  }
}
