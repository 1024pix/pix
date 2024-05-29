import Model, { attr } from '@ember-data/model';

export default class CertificationCandidateSubscription extends Model {
  @attr sessionId;
  @attr eligibleSubscription;
  @attr nonEligibleSubscription;
  @attr sessionVersion;

  get hasSubscription() {
    return this.eligibleSubscription || this.nonEligibleSubscription;
  }
}
