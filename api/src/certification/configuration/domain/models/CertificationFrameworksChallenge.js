export class CertificationFrameworksChallenge {
  constructor({ createdAt, challengeId, alpha, delta, complementaryCertificationKey }) {
    this.createdAt = createdAt;
    this.challengeId = challengeId;
    this.complementaryCertificationKey = complementaryCertificationKey;
    this.alpha = alpha;
    this.delta = delta;
  }

  calibrate({ activeCalibratedChallenges }) {
    const matchingActiveCalibratedChallenge = this.#findActiveCalibratedChallenge({
      activeCalibratedChallenges,
    });
    return new CertificationFrameworksChallenge({
      ...this,
      alpha: matchingActiveCalibratedChallenge.alpha,
      delta: matchingActiveCalibratedChallenge.delta,
    });
  }

  #findActiveCalibratedChallenge({ activeCalibratedChallenges }) {
    return activeCalibratedChallenges.find(
      (activeCalibratedChallenge) =>
        activeCalibratedChallenge.scope == this.complementaryCertificationKey &&
        activeCalibratedChallenge.challengeId == this.challengeId,
    );
  }
}
