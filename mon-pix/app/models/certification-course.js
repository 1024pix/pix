import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class CertificationCourse extends Model {
  // attributes
  @attr('string') accessCode;
  @attr('string') locale;
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
