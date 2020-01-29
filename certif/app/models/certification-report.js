import DS from 'ember-data';

const { Model, attr } = DS;

export default class CertificationReport extends Model {
  @attr('number') certificationCourseId;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') examinerComment;
  @attr('boolean') hasSeenEndTestScreen;
}
