export class BaseChallenge {
  /**
   * @param {Object} cachedChallengeDto
   */
  constructor(cachedChallengeDto) {
    /** @private */
    this._cachedChallengeDto = cachedChallengeDto;
  }

  /**
   * @readonly
   * @type {string}
   */
  get id() {
    return this._cachedChallengeDto.id;
  }

  /**
   * @readonly
   * @type {string}
   */
  get accessibility1() {
    return this._cachedChallengeDto.accessibility1;
  }

  /**
   * @readonly
   * @type {string}
   */
  get accessibility2() {
    return this._cachedChallengeDto.accessibility2;
  }

  /**
   * @readonly
   * @type {string}
   */
  get skillId() {
    return this._cachedChallengeDto.skillId;
  }
}
