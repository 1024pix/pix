import Model, { attr, hasMany } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import { memberAction } from 'ember-api-actions';

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
    const firstIssueReport = this.certificationIssueReports.firstObject;
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
