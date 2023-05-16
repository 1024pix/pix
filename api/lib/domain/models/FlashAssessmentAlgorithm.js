const { AssessmentEndedError } = require('../errors');
const { getPossibleNextChallenges } = require('../services/algorithm-methods/flash');

class FlashAssessmentAlgorithm {
  getPossibleNextChallenges({ allAnswers, challenges, estimatedLevel }) {
    const { possibleChallenges, hasAssessmentEnded } = getPossibleNextChallenges({
      allAnswers,
      challenges,
      estimatedLevel,
    });

    if (hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return possibleChallenges;
  }
}

module.exports = FlashAssessmentAlgorithm;
