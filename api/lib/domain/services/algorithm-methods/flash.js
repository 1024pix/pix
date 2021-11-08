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

function _getGaussianValue({ gaussianMean, value }) {
  const variance = 1.5;
  return Math.exp(Math.pow(value - gaussianMean, 2) / (-2 * variance)) / (Math.sqrt(variance) * Math.sqrt(2 * Math.PI));
}

function _getNormaliseData({ array }) {
  const sum = _.sum(array);
  return _.map(array, (value) => value / sum);
}
function getEstimatedLevel({ allAnswers, challenges }) {
  if (allAnswers.length === 0) {
    return DEFAULT_ESTIMATED_LEVEL;
  }

  const firstLevel = -9;
  const lastLevel = 9 + 18 / 80;
  const step = 18 / 80;
  const samples = _.range(firstLevel, lastLevel, step);
  let latestEstimatedLevel = DEFAULT_ESTIMATED_LEVEL;
  let probabilitiesToAnswersThisChallenge = samples.map(() => {
    return 1;
  });

  for (const answer of allAnswers) {
    let gaussianValuesForLevel = samples.map((sample) =>
      _getGaussianValue({ gaussianMean: latestEstimatedLevel, value: sample })
    );
    gaussianValuesForLevel = _getNormaliseData({ array: gaussianValuesForLevel });

    const answeredChallenge = _.find(challenges, ['id', answer.challengeId]);

    probabilitiesToAnswersThisChallenge = samples.map((sample, index) => {
      const probability = _getProbability({
        estimatedLevel: sample,
        discriminant: answeredChallenge.discriminant,
        difficulty: answeredChallenge.difficulty,
      });
      const probabilityToAdd = answer.isOk() ? probability : 1 - probability;
      return probabilityToAdd * probabilitiesToAnswersThisChallenge[index];
    });

    let probabilitiesToAnswersThisChallengeBis = probabilitiesToAnswersThisChallenge.map((value, index) => {
      const levelProbability = gaussianValuesForLevel[index];
      return value * levelProbability;
    });

    probabilitiesToAnswersThisChallengeBis = _getNormaliseData({ array: probabilitiesToAnswersThisChallengeBis });

    latestEstimatedLevel = samples.reduce(
      (estimatedLevel, sample, index) => estimatedLevel + sample * probabilitiesToAnswersThisChallengeBis[index],
      0
    );
  }

  return latestEstimatedLevel;
}
