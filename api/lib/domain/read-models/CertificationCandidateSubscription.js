class CertificationCandidateSubscription {
  constructor({ id, sessionId, eligibleSubscription, nonEligibleSubscription }) {
    this.id = id;
    this.sessionId = sessionId;
    this.eligibleSubscription = eligibleSubscription;
    this.nonEligibleSubscription = nonEligibleSubscription;
  }
}

export { CertificationCandidateSubscription };
