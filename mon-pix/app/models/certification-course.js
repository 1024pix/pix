import Model, { belongsTo, attr } from '@ember-data/model';

export default class CertificationCourse extends Model {
  // attributes
  @attr('string') accessCode;
  @attr('number') nbChallenges;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('number') version;

  // references
  @attr('number') sessionId;

  // includes
  @belongsTo('assessment', { async: true, inverse: 'certificationCourse' }) assessment;
}
