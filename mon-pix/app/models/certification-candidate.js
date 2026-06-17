import Model, { attr } from '@ember-data/model';

export default class CertificationCandidate extends Model {
  // attributes
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('boolean') hasSeenCertificationInstructions;
  @attr('string') subscription;
  @attr('boolean') hasStartedTest;
  @attr('boolean') doubleCertificationEligibility;

  // references
  @attr('number') sessionId;

  get isRegisteredToDoubleCertification() {
    return this.subscription === 'CLEA';
  }

  get isEligibleToDoubleCertification() {
    return this.isRegisteredToDoubleCertification && this.doubleCertificationEligibility;
  }
}
