const { AssessmentEndedError } = require('../errors');
const { getPossibleNextChallenges } = require('../services/algorithm-methods/flash');

class FlassAssessmentAlgorithm {
  constructor({ randomAlgorithm }) {
    this.randomAlgorithm = randomAlgorithm;
  }

  getNextChallenge({ allAnswers, challenges, estimatedLevel }) {
    const { possibleChallenges, hasAssessmentEnded } = getPossibleNextChallenges({
      allAnswers,
      challenges,
      estimatedLevel,
    });

    if (hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return this.chooseNextChallenge(possibleChallenges);
  }

  chooseNextChallenge(challenges) {
    const challengeIndex = this.randomAlgorithm(51, challenges.length);

    return challenges[challengeIndex];
  }
}

module.exports = FlassAssessmentAlgorithm;
