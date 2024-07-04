import Model, { attr } from '@ember-data/model';

export default class CertificationCandidate extends Model {
  // attributes
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('boolean') hasSeenCertificationInstructions;

  // references
  @attr('number') sessionId;
}
