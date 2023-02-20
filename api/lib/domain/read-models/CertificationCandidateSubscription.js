export default class CertificationCandidateSubscription {
  constructor({ id, sessionId, eligibleSubscriptions, nonEligibleSubscriptions }) {
    this.id = id;
    this.sessionId = sessionId;
    this.eligibleSubscriptions = eligibleSubscriptions;
    this.nonEligibleSubscriptions = nonEligibleSubscriptions;
  }
}
