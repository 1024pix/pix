const _ = require('lodash');

const DEFAULT_ESTIMATED_LEVEL = 0;

module.exports = { getPossibleNextChallenges, getEstimatedLevel };

function getPossibleNextChallenges({ challenges } = {}) {
  if (challenges?.length === 0) {
    return {
      hasAssessmentEnded: true,
      possibleChallenges: [],
    };
  }

  const estimatedLevel = DEFAULT_ESTIMATED_LEVEL;

  const challengesWithReward = challenges.map((challenge) => {
    return {
      challenge,
      reward: _getReward({ estimatedLevel, discriminant: challenge.discriminant, difficulty: challenge.difficulty }),
    };
  });

  let maxReward = 0;
  const possibleChallenges = challengesWithReward.reduce((acc, challengesWithReward) => {
    if (challengesWithReward.reward > maxReward) {
      acc = [challengesWithReward.challenge];
      maxReward = challengesWithReward.reward;
    } else if (challengesWithReward.reward === maxReward) {
      acc.push(challengesWithReward.challenge);
    }
    return acc;
  }, []);

  return {
    hasAssessmentEnded: false,
    possibleChallenges,
  };
}

function _getProbability({ estimatedLevel, discriminant, difficulty }) {
  return 1 / (1 + Math.exp(discriminant * (difficulty - estimatedLevel)));
}

function _getReward({ estimatedLevel, discriminant, difficulty }) {
  const probability = _getProbability({ estimatedLevel, discriminant, difficulty });
  return probability * (1 - probability) * Math.pow(discriminant, 2);
}

function _getGaussianValue({ gaussianMean, value }){
  const variance = 1.5;
  return Math.exp((Math.pow(value - gaussianMean, 2)/(-2*variance)))/(Math.sqrt(variance) * Math.sqrt(2*Math.PI));
}

function getEstimatedLevel({ allAnswers, challenges }) {
  if (allAnswers.length === 0) {
    return DEFAULT_ESTIMATED_LEVEL;
  }

  const firstLevel = -9;
  const lastLevel = 9 + 18/80;
  const step = 18/80;
  const allColumns = _.range(firstLevel, lastLevel, step);
  // allColumns = nodes

  // levelProbabilitiesForActuelEstimatedLevel = weight
  let levelProbabilitiesForActualEstimatedLevel = allColumns.map(column =>_getGaussianValue({ gaussianMean: 0, value:column }));
  const sumOfLevelProbabilities = _.sum(levelProbabilitiesForActualEstimatedLevel);

  const currentAnswer = allAnswers[0];
  const answeredChallenge = _.find(challenges, ['id',  currentAnswer.challengeId]);
  let probabilitiesToAnswersThisChallenge = allColumns.map((column, index) => {
    const probability = _getProbability({ estimatedLevel: column, discriminant: answeredChallenge.discriminant, difficulty: answeredChallenge.difficulty });
    const levelProbability = levelProbabilitiesForActualEstimatedLevel[index]/sumOfLevelProbabilities;
    return currentAnswer.isOk() ? probability*levelProbability : (1-probability)*levelProbability;
  });
  const sumOfProbabilitiesToAnswersThisChallenge = _.sum(probabilitiesToAnswersThisChallenge);
  // probabilitiesToAnswersThisChallenge : posterior

  const estimatedLevel = allColumns.reduce((estimatedLevel, column, index) => estimatedLevel + column * probabilitiesToAnswersThisChallenge[index]/sumOfProbabilitiesToAnswersThisChallenge, 0);
  return estimatedLevel;
}
