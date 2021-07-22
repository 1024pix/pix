const _ = require('lodash');

let id = 1;

class AlgoResult {

  constructor() {
    this._id = id++;
    this._challenges = [];
    this._estimatedLevels = [];
    this._answerStatuses = [];
    this._challengeLevels = [];
    this._biggestAscendingGap = 0;
    this._biggestDescendingGap = 0;
  }

  addChallenge(challenge) {
    this._challenges.push(challenge);
  }

  addChallengeLevel(level) {
    this._challengeLevels.push(level);
  }

  addEstimatedLevels(level) {
    this._estimatedLevels.push(level);
  }

  addAnswerStatus(answerStatus) {
    this._answerStatuses.push(answerStatus);
  }

  get _skillNames() {
    const skillsName = _
      .chain(this._challenges)
      .map((challenge) => challenge.skills)
      .flatMap()
      .map((skill) => skill.name)
      .value();
    const uniqSkillNames = new Set(skillsName);
    return [...uniqSkillNames].join(', ');
  }

  log() {
    const challengeIds = this._challenges.map((challenge) => challenge.id);
    this._computeGaps();
    const log = `
        Result ${this._id} :
        ----- total challenges asked: ${challengeIds.length}
        ----- challenge ids asked: ${challengeIds}
        ----- skill names: ${this._skillNames}
        ----- estimated levels evolution: ${this._estimatedLevels}
        ----- total answer KO: ${this._answerKOCount}
        ----- total answer OK: ${this._answerOKCount}
        ----- first challenge status: ${this._firstAnswerStatus}
        ----- biggest ASC gap: ${this._biggestAscendingGap}
        ----- biggest DESC gap: ${this._biggestDescendingGap}`;
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

  get _firstAnswerStatus() {
    if (this._answerStatuses.length === 0) return 'N/A';
    return this._answerStatuses[0].status;
  }

  _computeGaps() {
    for (let index = 1; index < this._challengeLevels.length; index++) {
      const gap = this._challengeLevels[index] - this._challengeLevels[index - 1];
      if (gap > this._biggestAscendingGap) {
        this._biggestAscendingGap = gap;
      }
      if (gap < this._biggestDescendingGap) {
        this._biggestDescendingGap = gap;
      }
    }
    this._biggestDescendingGap = Math.abs(this._biggestDescendingGap);
  }
}

module.exports = AlgoResult;
