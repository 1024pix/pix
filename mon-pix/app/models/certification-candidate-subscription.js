import Model, { attr } from '@ember-data/model';

export default class CertificationCandidateSubscription extends Model {
  @attr sessionId;
  @attr eligibleSubscriptions;
  @attr nonEligibleSubscription;
  @attr sessionVersion;

  get hasSubscription() {
    return this.eligibleSubscriptions?.length || this.nonEligibleSubscription;
  }

  get isSessionVersion3() {
    return this.sessionVersion === 3;
  }
}
