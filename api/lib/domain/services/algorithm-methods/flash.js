const _ = require('lodash');
const { Decimal } = require('decimal.js');

const config = require('../../../config');

const DEFAULT_ESTIMATED_LEVEL = 0;
const START_OF_SAMPLES = -9;
const STEP_OF_SAMPLES = 18 / 80;
const END_OF_SAMPLES = 9 + STEP_OF_SAMPLES;
const samples = _.range(START_OF_SAMPLES, END_OF_SAMPLES, STEP_OF_SAMPLES);
const DEFAULT_PROBABILITY_TO_ANSWER = 1;
const DEFAULT_ERROR_RATE = 5;
const ERROR_RATE_CLASS_INTERVAL = new Decimal(9 / 80);

module.exports = {
  getPossibleNextChallenges,
  getEstimatedLevelAndErrorRate,
  getNonAnsweredChallenges,
  DEFAULT_ESTIMATED_LEVEL,
};

function getPossibleNextChallenges({ allAnswers, challenges, estimatedLevel } = {}) {
  const nonAnsweredChallenges = getNonAnsweredChallenges({ allAnswers, challenges });

  if (nonAnsweredChallenges?.length === 0 || allAnswers.length >= config.features.numberOfChallengesForFlashMethod) {
    return {
      hasAssessmentEnded: true,
      possibleChallenges: [],
    };
  }

  const challengesWithReward = nonAnsweredChallenges.map((challenge) => {
    return {
      challenge,
      reward: _getReward({
        estimatedLevel: new Decimal(estimatedLevel),
        discriminant: new Decimal(challenge.discriminant),
        difficulty: new Decimal(challenge.difficulty),
      }),
    };
  });

  let maxReward = new Decimal(0);
  const possibleChallenges = challengesWithReward.reduce((acc, challengesWithReward) => {
    if (challengesWithReward.reward.greaterThan(maxReward)) {
      acc = [challengesWithReward.challenge];
      maxReward = challengesWithReward.reward;
    } else if (challengesWithReward.reward.equals(maxReward)) {
      acc.push(challengesWithReward.challenge);
    }
    return acc;
  }, []);

  return {
    hasAssessmentEnded: false,
    possibleChallenges,
  };
}

function getEstimatedLevelAndErrorRate({ allAnswers, challenges }) {
  if (allAnswers.length === 0) {
    return { estimatedLevel: DEFAULT_ESTIMATED_LEVEL, errorRate: DEFAULT_ERROR_RATE };
  }

  let latestEstimatedLevel = new Decimal(DEFAULT_ESTIMATED_LEVEL);

  const samplesWithResults = samples.map((sample) => ({
    sample: new Decimal(sample),
    gaussian: null,
    probabilityToAnswer: new Decimal(DEFAULT_PROBABILITY_TO_ANSWER),
    probability: null,
  }));

  for (const answer of allAnswers) {
    const answeredChallenge = _.find(challenges, ['id', answer.challengeId]);

    for (const sampleWithResults of samplesWithResults) {
      sampleWithResults.gaussian = _getGaussianValue({
        gaussianMean: latestEstimatedLevel,
        value: sampleWithResults.sample,
      });

      let probability = _getProbability({
        estimatedLevel: sampleWithResults.sample,
        discriminant: new Decimal(answeredChallenge.discriminant),
        difficulty: new Decimal(answeredChallenge.difficulty),
      });
      probability = answer.isOk() ? probability : Decimal.sub(1, probability);
      sampleWithResults.probabilityToAnswer = sampleWithResults.probabilityToAnswer.times(probability);
    }

    _normalizeFieldDistribution(samplesWithResults, 'gaussian');

    for (const sampleWithResults of samplesWithResults) {
      sampleWithResults.probability = sampleWithResults.probabilityToAnswer.times(sampleWithResults.gaussian);
    }

    _normalizeFieldDistribution(samplesWithResults, 'probability');

    latestEstimatedLevel = samplesWithResults.reduce(
      (estimatedLevel, { sample, probability }) => sample.times(probability).plus(estimatedLevel),
      new Decimal(0)
    );
  }

  const rawErrorRate = samplesWithResults.reduce(
    (acc, { sample, probability }) => sample.minus(latestEstimatedLevel).toPower(2).times(probability).plus(acc),
    new Decimal(0)
  );

  const correctedErrorRate = rawErrorRate.minus(ERROR_RATE_CLASS_INTERVAL.toPower(2).dividedBy(12)).squareRoot();

  return { estimatedLevel: latestEstimatedLevel.toNumber(), errorRate: correctedErrorRate.toNumber() };
}

function getNonAnsweredChallenges({ allAnswers, challenges }) {
  const getAnswerSkills = (answer) => challenges.find((challenge) => challenge.id === answer.challengeId).skills;
  const alreadyAnsweredSkillsIds = allAnswers
    .map(getAnswerSkills)
    .flat()
    .map((skill) => skill.id);

  const isSkillAlreadyAnswered = (skill) => alreadyAnsweredSkillsIds.includes(skill.id);
  const filterNonAnsweredChallenges = (challenge) => !challenge.skills.some(isSkillAlreadyAnswered);
  const nonAnsweredChallenges = _.filter(challenges, filterNonAnsweredChallenges);

  return nonAnsweredChallenges;
}

function _getReward({ estimatedLevel, discriminant, difficulty }) {
  const probability = _getProbability({ estimatedLevel, discriminant, difficulty });
  return Decimal.sub(1, probability).times(probability).times(discriminant.toPower(2));
}

function _getProbability({ estimatedLevel, discriminant, difficulty }) {
  return discriminant.times(difficulty.minus(estimatedLevel)).naturalExponential().plus(1).pow(-1);
}

const _gaussianValueVariance = 1.5;
const _pi = Decimal.acos(-1);
const _gaussianValueDivider = Decimal.sqrt(_gaussianValueVariance).times(_pi.times(2).squareRoot());
function _getGaussianValue({ gaussianMean, value }) {
  return value
    .minus(gaussianMean)
    .toPower(2)
    .dividedBy(-2 * _gaussianValueVariance)
    .naturalExponential()
    .dividedBy(_gaussianValueDivider);
}

function _normalizeFieldDistribution(data, field) {
  const sum = Decimal.sum(...data.map((item) => item[field]));
  for (const item of data) {
    item[field] = item[field].dividedBy(sum);
  }
}
