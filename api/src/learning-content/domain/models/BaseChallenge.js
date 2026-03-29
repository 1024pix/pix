export class BaseChallenge {
  constructor(cachedChallengeDto) {
    this._cachedChallengeDto = cachedChallengeDto;
  }

  get id() {
    return this._cachedChallengeDto.id;
  }

  get skillId() {
    return this._cachedChallengeDto.skillId;
  }

  get accessibility1() {
    return this._cachedChallengeDto.accessibility1;
  }

  get accessibility2() {
    return this._cachedChallengeDto.accessibility2;
  }
}
