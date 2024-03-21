export class CertificationChallengeCapacity {
  constructor({ answerId, certificationChallengeId, capacity, createdAt }) {
    this.answerId = answerId;
    this.certificationChallengeId = certificationChallengeId;
    this.capacity = capacity;
    this.createdAt = createdAt;
  }

  static create({ answerId, certificationChallengeId, capacity }) {
    return new CertificationChallengeCapacity({
      answerId,
      certificationChallengeId,
      capacity,
    });
  }
}
