class CertificationCandidateSubscription {
  constructor({ id, sessionId, eligibleSubscriptions, nonEligibleSubscription, sessionVersion }) {
    this.id = id;
    this.sessionId = sessionId;
    this.eligibleSubscriptions = eligibleSubscriptions;
    this.nonEligibleSubscription = nonEligibleSubscription;
    this.sessionVersion = sessionVersion;
  }
}

export { CertificationCandidateSubscription };
