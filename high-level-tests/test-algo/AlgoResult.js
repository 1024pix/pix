class AlgoResult {

  constructor() {
    this._challenges = [];
  }

  addChallenge(challenge) {
    this._challenges.push(challenge);
  }

  print() {
    const challengeIds = this._challenges.map((challenge) => challenge.id);
    console.log('----- challenge ids asked:');
    console.log(challengeIds);
  }
}

module.exports = AlgoResult;
