/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Model, { attr, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';
import { memberAction } from 'ember-api-actions';

export default class CertificationReport extends Model {
  @attr('number') certificationCourseId;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') hasSeenEndTestScreen;
  @attr('boolean') isCompleted;
  @attr('string') abortReason;

  @hasMany('certification-issue-report') certificationIssueReports;

  @computed('certificationIssueReports.@each.description')
  get firstIssueReportDescription() {
    const firstIssueReport = this.certificationIssueReports.firstObject;
    return firstIssueReport ? firstIssueReport.description : '';
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
