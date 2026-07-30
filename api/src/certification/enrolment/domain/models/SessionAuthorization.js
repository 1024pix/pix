export class SessionAuthorization {
  constructor({ id, isFinalized, hasExpired }) {
    this.id = id;
    this.isFinalized = isFinalized;
    this.hasExpired = hasExpired;
  }

  get canEnrollCandidateIndividually() {
    return !this.isFinalized && !this.hasExpired;
  }
}
