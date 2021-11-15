const _ = require('lodash');
const fp = require('lodash/fp');

const DEFAULT_ESTIMATED_LEVEL = 0;
const START_OF_SAMPLES = -9;
const STEP_OF_SAMPLES = 18 / 80;
const END_OF_SAMPLES = 9 + STEP_OF_SAMPLES;
const samples = _.range(START_OF_SAMPLES, END_OF_SAMPLES, STEP_OF_SAMPLES);

module.exports = { getPossibleNextChallenges, getEstimatedLevel };

function getPossibleNextChallenges({ allAnswers, challenges } = {}) {
  if (challenges?.length === 0) {
    return {
      hasAssessmentEnded: true,
      possibleChallenges: [],
    };
  }

  const estimatedLevel = getEstimatedLevel({ allAnswers, challenges });

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

function getEstimatedLevel({ allAnswers, challenges }) {
  if (allAnswers.length === 0) {
    return DEFAULT_ESTIMATED_LEVEL;
  }

  let latestEstimatedLevel = DEFAULT_ESTIMATED_LEVEL;
  let samplesProbabilities = Array(samples.length).fill(1);

  for (const answer of allAnswers) {
    const gaussianValuesForSamples = mapAndNormalizeDistribution(samples, (sample) =>
      _getGaussianValue({ gaussianMean: latestEstimatedLevel, value: sample })
    );

    const answeredChallenge = _.find(challenges, ['id', answer.challengeId]);

    samplesProbabilities = samples.map((sample, index) => {
      let probability = _getProbability({
        estimatedLevel: sample,
        discriminant: answeredChallenge.discriminant,
        difficulty: answeredChallenge.difficulty,
      });
      probability = answer.isOk() ? probability : 1 - probability;
      return probability * samplesProbabilities[index];
    });

    const probabilitiesToAnswersThisChallengeBis = mapAndNormalizeDistribution(samplesProbabilities, (value, index) => {
      const levelProbability = gaussianValuesForSamples[index];
      return value * levelProbability;
    });

    latestEstimatedLevel = samples.reduce(
      (estimatedLevel, sample, index) => estimatedLevel + sample * probabilitiesToAnswersThisChallengeBis[index],
      0
    );
  }

  return latestEstimatedLevel;
}

function _getReward({ estimatedLevel, discriminant, difficulty }) {
  const probability = _getProbability({ estimatedLevel, discriminant, difficulty });
  return probability * (1 - probability) * Math.pow(discriminant, 2);
}

function _getProbability({ estimatedLevel, discriminant, difficulty }) {
  return 1 / (1 + Math.exp(discriminant * (difficulty - estimatedLevel)));
}

function _getGaussianValue({ gaussianMean, value }) {
  const variance = 1.5;
  return Math.exp(Math.pow(value - gaussianMean, 2) / (-2 * variance)) / (Math.sqrt(variance) * Math.sqrt(2 * Math.PI));
}

function _normalizeDistribution(data) {
  const sum = _.sum(data);
  return _.map(data, (value) => value / sum);
}

const mapAndNormalizeDistribution = (data, mapper) =>
  fp.flow(
    // On utilise pas fp.map car certains mappers ont besoin de l'index
    (arr) => arr.map(mapper),
    _normalizeDistribution
  )(data);
