export class CertificationChallengeCapacity {
  constructor({ certificationChallengeId, capacity, createdAt }) {
    this.certificationChallengeId = certificationChallengeId;
    this.capacity = capacity;
    this.createdAt = createdAt;
  }

  static create({ certificationChallengeId, capacity }) {
    return new CertificationChallengeCapacity({
      certificationChallengeId,
      capacity,
    });
  }
}
