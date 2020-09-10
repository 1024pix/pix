import Model, { attr } from '@ember-data/model';

export default class CertificationReport extends Model {
  @attr('number') certificationCourseId;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') examinerComment;
  @attr('boolean') hasSeenEndTestScreen;
}
