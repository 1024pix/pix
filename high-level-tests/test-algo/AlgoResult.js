const _ = require('lodash');

class AlgoResult {

  constructor() {
    this._challenges = [];
    this._estimatedLevels = [];
    this._answerStatuses = [];
  }

  addChallenge(challenge) {
    this._challenges.push(challenge);
  }

  addEstimatedLevels(level) {
    this._estimatedLevels.push(level);
  }

  addAnswerStatus(answerStatus) {
    this._answerStatuses.push(answerStatus);
  }

  get skillNames() {
    const skillsName = _
      .chain(this._challenges)
      .map((challenge) => challenge.skills)
      .flatMap()
      .map((skill) => skill.name)
      .value();
    return new Set(skillsName);
  }

  log() {
    const challengeIds = this._challenges.map((challenge) => challenge.id);
    const log = `----- total challenges asked: ${challengeIds.length}
        ----- challenge ids asked: ${challengeIds}
        ----- skill names: ${this.skillNames}
        ----- estimated levels evolution: ${this._estimatedLevels}
        ----- total answer KO: ${this._answerKOCount}
        ----- total answer OK: ${this._answerOKCount}`;
    return log;
  }

  get _answerKOCount() {
    return this._answerStatuses
      .filter((answerStatus) => answerStatus.isKO())
      .length;
  }

  get _answerOKCount() {
    return this._answerStatuses
      .filter((answerStatus) => answerStatus.isOK())
      .length;
  }
}

module.exports = AlgoResult;
