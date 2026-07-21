import Model, { attr } from '@warp-drive/legacy/model';

export default class CertificationCandidate extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('string') subscription;

  get hasCoreScopedSubscription() {
    return this.subscription === 'CORE' || this.subscription === 'CLEA';
  }
}
