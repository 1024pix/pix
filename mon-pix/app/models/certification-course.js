import Model, { belongsTo, attr } from '@ember-data/model';

export default class CertificationCourse extends Model {

  // attributes
  @attr('string') accessCode;
  @attr('number') nbChallenges;

  // references
  @attr('number') sessionId;

  // includes
  @belongsTo('assessment') assessment;
}
