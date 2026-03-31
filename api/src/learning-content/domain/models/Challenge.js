export class Challenge {
  #cachedChallengeDto;

  /**
   * @param {Object} cachedChallengeDto
   */
  constructor(cachedChallengeDto) {
    this.#cachedChallengeDto = cachedChallengeDto;
  }

  /**
   * @readonly
   * @type {string}
   */
  get id() {
    return this.#cachedChallengeDto.id;
  }

  /**
   * @readonly
   * @type {string}
   */
  get accessibility1() {
    return this.#cachedChallengeDto.accessibility1;
  }

  /**
   * @readonly
   * @type {string}
   */
  get accessibility2() {
    return this.#cachedChallengeDto.accessibility2;
  }

  /**
   * @readonly
   * @type {string}
   */
  get skillId() {
    return this.#cachedChallengeDto.skillId;
  }
}
