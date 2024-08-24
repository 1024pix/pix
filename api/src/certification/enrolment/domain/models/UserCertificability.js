export class UserCertificability {
  #userId;
  #certificability;
  #certificabilityV2;

  constructor({ userId, certificability, certificabilityV2 }) {
    this.#userId = userId;
    this.#certificability = certificability;
    this.#certificabilityV2 = certificabilityV2;
  }
}
