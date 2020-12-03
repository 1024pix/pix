import Model, { attr, hasMany } from '@ember-data/model';

export default class CertificationReport extends Model {
  @attr('number') certificationCourseId;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') examinerComment; // todo: remove ?
  @attr('boolean') hasSeenEndTestScreen;

  @hasMany('certification-issue-report') certificationIssueReports;
}
