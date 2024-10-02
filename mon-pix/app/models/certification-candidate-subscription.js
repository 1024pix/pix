import Model, { attr } from '@ember-data/model';

export default class CertificationCandidateSubscription extends Model {
  @attr sessionId;
  @attr eligibleSubscriptions;
  @attr nonEligibleSubscription;
  @attr sessionVersion;

  get hasSubscription() {
    return this.eligibleSubscriptions?.length || this.nonEligibleSubscription;
  }

  get hasV3Subscription() {
    return this.isSessionVersion3 && this.eligibleSubscriptions?.length;
  }

  get isV3CoreOnly() {
    return (
      this.isSessionVersion3 && this.eligibleSubscriptions.length === 1 && this.eligibleSubscriptions[0].type === 'CORE'
    );
  }

  get isSessionVersion3() {
    return this.sessionVersion === 3;
  }
}
