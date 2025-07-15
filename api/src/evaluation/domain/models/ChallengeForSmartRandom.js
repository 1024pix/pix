export class ChallengeForSmartRandom {
  constructor({ id, status, focused, timer, skillId, locales }) {
    this.id = id;
    this.status = status;
    this.focused = focused;
    this.timer = timer;
    this.skillId = skillId;
    this.locales = locales;
  }

  static fromLearningContentApiDto(challengeApiDto) {
    return new ChallengeForSmartRandom({
      id: challengeApiDto.id,
      status: challengeApiDto.status,
      focused: challengeApiDto.focused,
      timer: challengeApiDto.timer,
      skillId: challengeApiDto.skillId,
      locales: challengeApiDto.locales,
    });
  }

  isTimed() {
    return Number.isFinite(Number.parseFloat(this.timer));
  }
}
