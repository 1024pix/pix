import Model, { attr, belongsTo } from '@ember-data/model';

export default class CertificationCourse extends Model {
  // attributes
  @attr('string') accessCode;
  @attr('number') nbChallenges;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('number') version;
  @attr('boolean') isAdjustedForAccessibility;

  // references
  @attr('number') sessionId;

  // includes
  @belongsTo('assessment', { async: true, inverse: 'certificationCourse' }) assessment;
}
