class CertificationCandidateSubscription {
  constructor({ id, sessionId, eligibleSubscription, nonEligibleSubscription, sessionVersion }) {
    this.id = id;
    this.sessionId = sessionId;
    this.eligibleSubscription = eligibleSubscription;
    this.nonEligibleSubscription = nonEligibleSubscription;
    this.sessionVersion = sessionVersion;
  }
}

export { CertificationCandidateSubscription };
