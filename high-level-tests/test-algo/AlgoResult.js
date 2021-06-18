const _ = require('lodash');

class AlgoResult {

  constructor() {
    this._challenges = [];
    this._estimatedLevels = [];
  }

  addChallenge(challenge) {
    this._challenges.push(challenge);
  }

  addEstimatedLevels(level) {
    this._estimatedLevels.push(level);
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

  print() {
    const challengeIds = this._challenges.map((challenge) => challenge.id);
    console.log('----- total challenges asked:', challengeIds.length);
    console.log('----- challenge ids asked:');
    console.log(challengeIds);
    console.log('----- skill names:');
    console.log(this.skillNames);
    console.log('----- estimated levels evolution:');
    console.log(this._estimatedLevels);
  }
}

module.exports = AlgoResult;
