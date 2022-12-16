const { v4: uuidv4 } = require('uuid');
const CsvFile = require('./utils/CsvFile');

class AlgoResult {

  constructor() {
    this._id = uuidv4();
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
    const skillsName = this._challenges.map((challenge) => challenge.skill.name);
    const uniqSkillNames = new Set(skillsName);
    return [...uniqSkillNames];
  }

  get _challengeIds() {
    return this._challenges.map((challenge) => challenge.id);
  }

  log() {
    this._computeGaps();
    const log = `
        Result ${this._id} :
        ----- total challenges asked: ${this._challengeIds.length}
        ----- challenge ids asked: ${this._challengeIds}
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

  _getResults(testSet) {
    const challengeIds = this._challengeIds;
    const skillNames = this._skillNames;
    return challengeIds.map((challengeId, index) => {
      return {
        id: this._id,
        nChallenge: index + 1,
        challengeId: challengeIds[index],
        challengeLevel: this._challengeLevels[index],
        skillName: skillNames[index],
        estimatedLevel: this._estimatedLevels[index],
        answerStatus: this._answerStatuses[index].status,
        testSet,
      };
    });
  }

  async writeCsvFile(testSet) {
    const results = this._getResults(testSet);
    const headers = Object.keys(results[0]);
    const csvFile = new CsvFile(headers);
    await csvFile.append(results);
  }
}

module.exports = AlgoResult;
