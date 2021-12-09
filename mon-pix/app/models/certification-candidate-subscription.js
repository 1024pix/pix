import Model, { attr } from '@ember-data/model';

export default class CertificationCandidateSubscription extends Model {
  @attr sessionId;
  @attr eligibleSubscriptions;
  @attr nonEligibleSubscriptions;
}
