import { memberAction } from '@1024pix/ember-api-actions';
import { computed } from '@ember/object';
import Model, { attr, hasMany } from '@ember-data/model';

export default class CertificationReport extends Model {
  @attr('number') certificationCourseId;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') hasSeenEndTestScreen;
  @attr('boolean') isCompleted;
  @attr('string') abortReason;

  @hasMany('certification-issue-report', { async: false, inverse: 'certificationReport' }) certificationIssueReports;

  @computed('certificationIssueReports.@each.description')
  get firstIssueReportDescription() {
    const firstIssueReport = this.certificationIssueReports[0];
    return firstIssueReport ? firstIssueReport.description : '';
  }

  get isInvalid() {
    return !this.isCompleted && this.abortReason === null;
  }

  toJSON() {
    return {
      id: this.id,
      certificationCourseId: this.certificationCourseId,
      firstName: this.firstName,
      lastName: this.lastName,
      hasSeenEndTestScreen: this.hasSeenEndTestScreen,
      isCompleted: this.isCompleted,
      abortReason: this.abortReason,
    };
  }

  abort = memberAction({
    type: 'post',
    urlType: 'abort-certification',
    before(reason) {
      return {
        data: {
          reason,
        },
      };
    },
  });
}
