/**
 * @typedef {import('../../models/CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../../../../evaluation/domain/models/Answer.js').Answer} Answer
 */

import { logger } from '../../../../../shared/infrastructure/utils/logger.js';

const DEFAULT_CAPACITY = 0;
const START_OF_SAMPLES = -9;
const STEP_OF_SAMPLES = 18 / 80;
const END_OF_SAMPLES = 9;
const samples = generateSampleArray(START_OF_SAMPLES, END_OF_SAMPLES, STEP_OF_SAMPLES);
const DEFAULT_PROBABILITY_TO_ANSWER = 1;
const DEFAULT_ERROR_RATE = 5;
const ERROR_RATE_CLASS_INTERVAL = 9 / 80;

const MAX_NUMBER_OF_RETURNED_CHALLENGES = 5;

function generateSampleArray(start, end, step) {
  let i = start;
  const resultArray = [];
  while (i < end) {
    resultArray.push(i);
    i += step;
  }
  return resultArray;
}

/**
 * @param {object} params
 * @param {CalibratedChallenge[]} params.availableChallenges
 * @param {number} [params.capacity=DEFAULT_CAPACITY]
 */
export function getPossibleNextChallenges({ availableChallenges, capacity = DEFAULT_CAPACITY }) {
  const challengesWithReward = availableChallenges.map((challenge) => {
    return {
      challenge,
      reward: getReward({
        capacity,
        discriminant: challenge.discriminant,
        difficulty: challenge.difficulty,
      }),
    };
  });

  return _findBestPossibleChallenges(challengesWithReward, capacity);
}

/**
 * @param {object} params
 * @param {Answer[]} params.allAnswers
 * @param {CalibratedChallenge[]} params.challenges
 * @param {number} [params.capacity=DEFAULT_CAPACITY]
 * @param {number} params.variationPercent
 */
export function getCapacityAndErrorRate({ allAnswers, challenges, capacity = DEFAULT_CAPACITY, variationPercent }) {
  if (challenges.length === 0 || allAnswers.length === 0) {
    return { capacity, errorRate: DEFAULT_ERROR_RATE };
  }

  const capacityHistory = getCapacityAndErrorRateHistory({
    allAnswers,
    challenges,
    capacity,
    variationPercent,
  });

  return capacityHistory.at(-1);
}

/**
 * @param {object} params
 * @param {Answer[]} params.allAnswers
 * @param {CalibratedChallenge[]} params.challenges
 * @param {number} [params.capacity=DEFAULT_CAPACITY]
 * @param {number} params.variationPercent
 */
export function getCapacityAndErrorRateHistory({
  allAnswers,
  challenges,
  capacity = DEFAULT_CAPACITY,
  variationPercent,
}) {
  let latestCapacity = capacity;

  let likelihood = samples.map(() => DEFAULT_PROBABILITY_TO_ANSWER);
  let normalizedPosteriori;
  let answerIndex = 0;
  let answer;

  const capacityHistory = [];

  while (answerIndex < allAnswers.length) {
    answer = allAnswers[answerIndex];

    ({ latestCapacity, likelihood, normalizedPosteriori } = _singleMeasure({
      challenges,
      answer,
      latestCapacity,
      likelihood,
      normalizedPosteriori,
      variationPercent,
    }));

    answerIndex++;

    capacityHistory.push({
      answerId: answer.id,
      capacity: latestCapacity,
      errorRate: _computeCorrectedErrorRate(latestCapacity, normalizedPosteriori),
    });
  }

  return capacityHistory;
}

/**
 * @private
 * @param {object} params
 * @param {CalibratedChallenge[]} params.challenges
 * @param {Answer} params.answer
 * @param {number} params.latestCapacity
 * @param {number[]} params.likelihood
 * @param {number[]} params.normalizedPosteriori
 * @param {number} params.variationPercent
 * @returns {{ latestCapacity: number, likelihood: number[], normalizedPosteriori: number[] }}
 */
function _singleMeasure({ challenges, answer, latestCapacity, likelihood, normalizedPosteriori, variationPercent }) {
  const answeredChallenge = _findChallengeForAnswer(challenges, answer);

  const normalizedPrior = _computeNormalizedPrior(latestCapacity);

  likelihood = _computeLikelihood(answeredChallenge, answer, likelihood);

  normalizedPosteriori = _computeNormalizedPosteriori(likelihood, normalizedPrior);

  latestCapacity = _computeCapacity(latestCapacity, variationPercent, normalizedPosteriori);
  return { latestCapacity, likelihood, normalizedPosteriori };
}

/**
 * @private
 * @param {number} gaussianMean
 * @returns {number[]}
 */
function _computeNormalizedPrior(gaussianMean) {
  return _normalizeDistribution(
    samples.map((sample) =>
      _getGaussianValue({
        gaussianMean: gaussianMean,
        value: sample,
      }),
    ),
  );
}

/**
 * @private
 * @param {CalibratedChallenge} answeredChallenge
 * @param {Answer} answer
 * @param {number[]} previousLikelihood
 * @returns {number[]}
 */
function _computeLikelihood(answeredChallenge, answer, previousLikelihood) {
  return samples.map((sample, index) => {
    let probability = _getProbability(sample, answeredChallenge.discriminant, answeredChallenge.difficulty);
    probability = answer.isOk() ? probability : 1 - probability;
    return previousLikelihood[index] * probability;
  });
}

/**
 * @param {number[]} likelihood
 * @param {number[]} normalizedGaussian
 * @returns {number[]}
 */
function _computeNormalizedPosteriori(likelihood, normalizedGaussian) {
  const posteriori = samples.map((_, index) => likelihood[index] * normalizedGaussian[index]);

  return _normalizeDistribution(posteriori);
}

/**
 * @private
 * @param {number} previousCapacity
 * @param {number} variationPercent
 * @param {number[]} normalizedPosteriori
 * @returns {number}
 */
function _computeCapacity(previousCapacity, variationPercent, normalizedPosteriori) {
  const rawCapacities = samples.map((sample, index) => sample * normalizedPosteriori[index]);
  const rawNextCapacity = rawCapacities.reduce((accumulator, capacity) => accumulator + capacity, 0);

  return variationPercent
    ? _limitCapacityVariation(previousCapacity, rawNextCapacity, variationPercent)
    : rawNextCapacity;
}

/**
 * @private
 * @param {number} latestCapacity
 * @param {number[]} normalizedPosteriori
 * @returns {number}
 */
function _computeCorrectedErrorRate(latestCapacity, normalizedPosteriori) {
  const errorRates = samples.map((sample, index) => normalizedPosteriori[index] * (sample - latestCapacity) ** 2);
  const rawErrorRate = errorRates.reduce((accumulator, rate) => accumulator + rate, 0);

  // oxfmt-ignore
  return Math.sqrt(rawErrorRate - (ERROR_RATE_CLASS_INTERVAL ** 2) / 12.0);
}

/**
 * @private
 * @param {object} params
 * @param {Answer[]} params.allAnswers
 * @param {CalibratedChallenge[]} params.challenges
 */
export function getChallengesForNonAnsweredSkills({ allAnswers, challenges }) {
  const alreadyAnsweredSkillsIds = allAnswers
    .map((answer) => _findChallengeForAnswer(challenges, answer))
    .map((challenge) => challenge.skill.id);

  const challengesForNonAnsweredSkills = challenges.filter((challenge) =>
    isNonAnsweredSkill(alreadyAnsweredSkillsIds, challenge.skill),
  );

  return challengesForNonAnsweredSkills;
}

function isNonAnsweredSkill(alreadyAnsweredSkillsIds, skill) {
  return !alreadyAnsweredSkillsIds.includes(skill.id);
}
/**
 * @private
 * @param {number} previousCapacity
 * @param {number} nextCapacity
 * @param {number} variationPercent
 * @returns {number}
 */
function _limitCapacityVariation(previousCapacity, nextCapacity, variationPercent) {
  const hasSmallCapacity = -variationPercent < previousCapacity && previousCapacity < variationPercent;

  const gap = hasSmallCapacity ? variationPercent : Math.abs(previousCapacity * variationPercent);

  return nextCapacity > previousCapacity
    ? Math.min(nextCapacity, previousCapacity + gap)
    : Math.max(nextCapacity, previousCapacity - gap);
}

/**
 * @private
 * @param {{challenge: CalibratedChallenge, reward: number}[]} challengesWithReward
 * @param {number} capacity
 * @returns {CalibratedChallenge[]}
 */
function _findBestPossibleChallenges(challengesWithReward) {
  /**
   * @param {{challenge: CalibratedChallenge, reward: number}} challengeWithReward
   * @returns {boolean}
   */
  const orderedChallengesWithReward = challengesWithReward.sort((a, b) => {
    return a.reward > b.reward ? -1 : a.reward < b.reward ? 1 : 0;
  });

  const possibleChallengesWithReward = orderedChallengesWithReward.slice(0, MAX_NUMBER_OF_RETURNED_CHALLENGES);

  return possibleChallengesWithReward.map((challengeWithReward) => challengeWithReward.challenge);
}

/**
 * @private
 * @param {CalibratedChallenge[]} challenges
 * @param {Answer} answer
 * @returns {CalibratedChallenge}
 */
function _findChallengeForAnswer(challenges, answer) {
  const challengeAssociatedToAnswer = challenges.find((challenge) => challenge.id === answer.challengeId);
  if (!challengeAssociatedToAnswer) {
    logger.warn({ answer }, 'Cannot find a challenge associated to answer.challengeId');
  }
  return challengeAssociatedToAnswer;
}

/**
 * @param {object} params
 * @param {number} params.capacity
 * @param {number} params.discriminant
 * @param {number} params.difficulty
 */
export function getReward({ capacity, discriminant, difficulty }) {
  const probability = _getProbability(capacity, discriminant, difficulty);
  return probability * (1 - probability) * Math.pow(discriminant, 2);
}

/**
 * Parameters are not wrapped inside an object for performance reasons.
 * It avoids creating an object before each call which will trigger lots of
 * garbage collection, especially when running simulators.
 * @private
 * @param {number} capacity
 * @param {number} discriminant
 * @param {number} difficulty
 * @returns {number}
 */
function _getProbability(capacity, discriminant, difficulty) {
  return 1 / (1 + Math.exp(discriminant * (difficulty - capacity)));
}

/**
 * @private
 * @param {object} params
 * @param {number} params.gaussianMean
 * @param {number} params.value
 * @returns {number}
 */
function _getGaussianValue({ gaussianMean, value }) {
  const variance = 1.5;
  return Math.exp(Math.pow(value - gaussianMean, 2) / (-2 * variance)) / (Math.sqrt(variance) * Math.sqrt(2 * Math.PI));
}

/**
 * @private
 * @param {number[]} data
 * @returns {number[]}
 */
function _normalizeDistribution(data) {
  const sum = data.reduce((s, d) => s + d, 0);
  return data.map((value) => value / sum);
}
