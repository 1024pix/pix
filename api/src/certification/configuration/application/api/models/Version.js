export class Version {
  #baseVersion;

  constructor(baseVersion) {
    this.#baseVersion = baseVersion;
  }

  get id() {
    return this.#baseVersion.id;
  }

  get scope() {
    return this.#baseVersion.scope;
  }

  get startDate() {
    return this.#baseVersion.startDate === null ? null : new Date(this.#baseVersion.startDate);
  }

  get expirationDate() {
    return this.#baseVersion.expirationDate === null ? null : new Date(this.#baseVersion.expirationDate);
  }

  get assessmentDuration() {
    return this.#baseVersion.assessmentDuration;
  }

  get minimumAnswersRequiredToValidateACertification() {
    return this.#baseVersion.minimumAnswersRequiredToValidateACertification;
  }

  get globalScoringConfiguration() {
    return structuredClone(this.#baseVersion.globalScoringConfiguration);
  }

  get competencesScoringConfiguration() {
    return structuredClone(this.#baseVersion.competencesScoringConfiguration);
  }

  get maxReachableLevel() {
    return this.#baseVersion.maxReachableLevel;
  }

  get maxReachablePixScore() {
    return this.#baseVersion.maxReachablePixScore;
  }

  /**
   * @returns {FlashAssessmentAlgorithmConfiguration}
   */
  get challengesConfiguration() {
    return structuredClone(this.#baseVersion.challengesConfiguration);
  }
}
