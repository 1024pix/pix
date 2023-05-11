const { AssessmentEndedError } = require('../errors');
const { getPossibleNextChallenges } = require('../services/algorithm-methods/flash');

class AssessmentAlgorithm {
  constructor({ assessment, randomAlgorithm }) {
    this.assessment = assessment;
    this.randomAlgorithm = randomAlgorithm;
  }

  getNextChallenge({ allAnswers, challenges, estimatedLevel }) {
    const algoResult = getPossibleNextChallenges({ allAnswers, challenges, estimatedLevel });

    if (algoResult.hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return this.assessment.chooseNextFlashChallenge({
      challenges: algoResult.possibleChallenges,
      randomAlgorithm: this.randomAlgorithm,
    });
  }
}

module.exports = AssessmentAlgorithm;
