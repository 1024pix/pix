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

  print() {
    const challengeIds = this._challenges.map((challenge) => challenge.id);
    console.log('----- challenge ids asked:');
    console.log(challengeIds);
    console.log('----- estimated levels evolution:');
    console.log(this._estimatedLevels);
  }
}

module.exports = AlgoResult;
