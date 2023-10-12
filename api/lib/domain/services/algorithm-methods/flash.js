import lodash from 'lodash';

const { orderBy, range, sortBy, sortedUniqBy, sumBy } = lodash;

import { config } from '../../../config.js';

const DEFAULT_ESTIMATED_LEVEL = 0;
const START_OF_SAMPLES = -9;
const STEP_OF_SAMPLES = 18 / 80;
const END_OF_SAMPLES = 9 + STEP_OF_SAMPLES;
const samples = range(START_OF_SAMPLES, END_OF_SAMPLES, STEP_OF_SAMPLES);
const DEFAULT_PROBABILITY_TO_ANSWER = 1;
const DEFAULT_ERROR_RATE = 5;
const ERROR_RATE_CLASS_INTERVAL = 9 / 80;

const MAX_NUMBER_OF_RETURNED_CHALLENGES = 5;

export {
  getPossibleNextChallenges,
  getEstimatedLevelAndErrorRate,
  getChallengesForNonAnsweredSkills,
  calculateTotalPixScoreAndScoreByCompetence,
  getReward,
};

function getPossibleNextChallenges({
  allAnswers,
  allChallenges,
  availableChallenges,
  estimatedLevel = DEFAULT_ESTIMATED_LEVEL,
  options: {
    warmUpLength = 0,
    forcedCompetences = [],
    challengesBetweenSameCompetence = 0,
    minimalSuccessRate = 0,
    enablePassageByAllCompetences = true,
  } = {},
} = {}) {
  let nonAnsweredChallenges = availableChallenges;

  if (allAnswers.length >= warmUpLength && enablePassageByAllCompetences) {
    const answersAfterWarmup = _getAnswersAfterWarmup({ answers: allAnswers, warmUpLength });

    nonAnsweredChallenges = _filterAlreadyAnsweredCompetences({
      answers: answersAfterWarmup,
      nonAnsweredChallenges,
      challenges: allChallenges,
      forcedCompetences,
    });
  }

  if (nonAnsweredChallenges?.length === 0 || allAnswers.length >= config.features.numberOfChallengesForFlashMethod) {
    return {
      hasAssessmentEnded: true,
      possibleChallenges: [],
    };
  }

  const lastCompetenceIds = _getLastAnswersCompetenceIds(allAnswers, allChallenges, challengesBetweenSameCompetence);

  const challengesWithNoRecentlyAnsweredCompetence = nonAnsweredChallenges.filter(
    ({ competenceId }) => !lastCompetenceIds.includes(competenceId),
  );

  const possibleChallenges =
    challengesWithNoRecentlyAnsweredCompetence.length > 0
      ? challengesWithNoRecentlyAnsweredCompetence
      : nonAnsweredChallenges;

  const challengesWithReward = possibleChallenges.map((challenge) => {
    return {
      challenge,
      reward: getReward({ estimatedLevel, discriminant: challenge.discriminant, difficulty: challenge.difficulty }),
    };
  });

  return {
    hasAssessmentEnded: false,
    possibleChallenges: _findBestPossibleChallenges(challengesWithReward, minimalSuccessRate, estimatedLevel),
  };
}

function getEstimatedLevelAndErrorRate({ allAnswers, challenges, estimatedLevel = DEFAULT_ESTIMATED_LEVEL }) {
  if (allAnswers.length === 0) {
    return { estimatedLevel, errorRate: DEFAULT_ERROR_RATE };
  }

  let latestEstimatedLevel = estimatedLevel;

  const samplesWithResults = samples.map((sample) => ({
    sample,
    gaussian: null,
    probabilityToAnswer: DEFAULT_PROBABILITY_TO_ANSWER,
    probability: null,
  }));

  for (const answer of allAnswers) {
    const answeredChallenge = challenges.find(({ id }) => id === answer.challengeId);

    for (const sampleWithResults of samplesWithResults) {
      sampleWithResults.gaussian = _getGaussianValue({
        gaussianMean: latestEstimatedLevel,
        value: sampleWithResults.sample,
      });

      let probability = _getProbability(
        sampleWithResults.sample,
        answeredChallenge.discriminant,
        answeredChallenge.difficulty,
      );
      probability = answer.isOk() ? probability : 1 - probability;
      sampleWithResults.probabilityToAnswer *= probability;
    }

    _normalizeFieldDistribution(samplesWithResults, 'gaussian');

    for (const sampleWithResults of samplesWithResults) {
      sampleWithResults.probability = sampleWithResults.probabilityToAnswer * sampleWithResults.gaussian;
    }

    _normalizeFieldDistribution(samplesWithResults, 'probability');

    latestEstimatedLevel = samplesWithResults.reduce(
      (estimatedLevel, { sample, probability }) => estimatedLevel + sample * probability,
      0,
    );
  }

  const rawErrorRate = samplesWithResults.reduce(
    (acc, { sample, probability }) => acc + probability * (sample - latestEstimatedLevel) ** 2,
    0,
  );

  const correctedErrorRate = Math.sqrt(rawErrorRate - (ERROR_RATE_CLASS_INTERVAL ** 2) / 12.0); // prettier-ignore

  return { estimatedLevel: latestEstimatedLevel, errorRate: correctedErrorRate };
}

function getChallengesForNonAnsweredSkills({ allAnswers, challenges }) {
  const alreadyAnsweredSkillsIds = allAnswers
    .map((answer) => _findChallengeForAnswer(challenges, answer))
    .map((challenge) => challenge.skill.id);

  const isNonAnsweredSkill = (skill) => !alreadyAnsweredSkillsIds.includes(skill.id);
  const challengesForNonAnsweredSkills = challenges.filter((challenge) => isNonAnsweredSkill(challenge.skill));

  return challengesForNonAnsweredSkills;
}

function calculateTotalPixScoreAndScoreByCompetence({ allAnswers, challenges, estimatedLevel }) {
  const succeededChallenges = _getDirectSucceededChallenges({ allAnswers, challenges });

  const inferredChallenges = _getInferredChallenges({
    challenges: getChallengesForNonAnsweredSkills({ allAnswers, challenges }),
    estimatedLevel,
  });

  const pixScoreAndScoreByCompetence = _sumPixScoreAndScoreByCompetence([
    ...succeededChallenges,
    ...inferredChallenges,
  ]);

  return pixScoreAndScoreByCompetence;
}

function _getAnswersAfterWarmup({ answers, warmUpLength }) {
  return answers.slice(warmUpLength);
}

function _filterAlreadyAnsweredCompetences({ answers, challenges, forcedCompetences, nonAnsweredChallenges }) {
  const answeredCompetenceIds = answers.map(
    ({ challengeId }) => lodash.find(challenges, { id: challengeId }).competenceId,
  );

  const remainingCompetenceIds = forcedCompetences.filter(
    (competenceId) => !answeredCompetenceIds.includes(competenceId),
  );

  const allCompetencesAreAnswered = remainingCompetenceIds.length === 0;

  return nonAnsweredChallenges.filter(
    ({ competenceId }) => allCompetencesAreAnswered || remainingCompetenceIds.includes(competenceId),
  );
}

function _getLastAnswersCompetenceIds(allAnswers, allChallenges, numberOfAnswers) {
  const lastAnswers = allAnswers.slice(-numberOfAnswers);
  const competenceIds = lastAnswers.map((answer) => {
    const challenge = _findChallengeForAnswer(allChallenges, answer);
    return challenge.competenceId;
  });

  return competenceIds;
}

function _findBestPossibleChallenges(challengesWithReward, minimumSuccessRate, estimatedLevel) {
  const hasMinimumSuccessRate = ({ challenge }) => {
    const successProbability = _getProbability(estimatedLevel, challenge.discriminant, challenge.difficulty);

    return successProbability >= minimumSuccessRate;
  };

  const orderedChallengesWithReward = orderBy(
    challengesWithReward,
    [hasMinimumSuccessRate, 'reward'],
    ['desc', 'desc'],
  );

  const possibleChallengesWithReward = orderedChallengesWithReward.slice(0, MAX_NUMBER_OF_RETURNED_CHALLENGES);

  return possibleChallengesWithReward.map(({ challenge }) => challenge);
}

function _getDirectSucceededChallenges({ allAnswers, challenges }) {
  const correctAnswers = allAnswers.filter((answer) => answer.isOk());
  return correctAnswers.map((answer) => _findChallengeForAnswer(challenges, answer));
}

function _getInferredChallenges({ challenges, estimatedLevel }) {
  const challengesForInferrence = _findChallengesForInferrence(challenges);
  return challengesForInferrence.filter((challenge) => estimatedLevel >= challenge.minimumCapability);
}

/**
 * Returns a list of challenges containing for each skill
 * the challenge with the lowest minimum capability,
 * prioritizing validated challenges over archived ones.
 *
 * @param {import('../../models/Challenge')[]} challenges
 * @returns A list of challenges for scoring inferrence
 */
function _findChallengesForInferrence(challenges) {
  return sortedUniqBy(
    orderBy(challenges, ['skill.id', getChallengePriorityForInferrence, 'minimumCapability']),
    'skill.id',
  );
}

const challengeStatusPriorityForInferrence = ['validé', 'archivé'];

function getChallengePriorityForInferrence(challenge) {
  const priority = challengeStatusPriorityForInferrence.indexOf(challenge.status);
  return priority === -1 ? 100 : priority;
}

function _findChallengeForAnswer(challenges, answer) {
  return challenges.find((challenge) => challenge.id === answer.challengeId);
}

function _sumPixScoreAndScoreByCompetence(challenges) {
  const scoreBySkillId = {};
  const scoreByCompetenceId = {};

  for (const challenge of challenges) {
    const { id: skillId, competenceId, pixValue } = challenge.skill;

    if (scoreBySkillId[skillId]) continue;

    scoreBySkillId[skillId] = pixValue;

    const previousCompetenceScore = scoreByCompetenceId[competenceId] ?? 0;

    scoreByCompetenceId[competenceId] = pixValue + previousCompetenceScore;
  }

  const pixScore = Object.values(scoreBySkillId).reduce((sum, pixValue) => sum + pixValue, 0);
  const pixScoreByCompetence = sortBy(
    Object.entries(scoreByCompetenceId).map(([competenceId, pixScore]) => ({
      competenceId,
      pixScore,
    })),
    'competenceId',
  );

  return { pixScore, pixScoreByCompetence };
}

function getReward({ estimatedLevel, discriminant, difficulty }) {
  const probability = _getProbability(estimatedLevel, discriminant, difficulty);
  return probability * (1 - probability) * Math.pow(discriminant, 2);
}

// Parameters are not wrapped inside an object for performance reasons
// It avoids creating an object before each call which will trigger lots of
// garbage collection, especially when running simulators
function _getProbability(estimatedLevel, discriminant, difficulty) {
  return 1 / (1 + Math.exp(discriminant * (difficulty - estimatedLevel)));
}

function _getGaussianValue({ gaussianMean, value }) {
  const variance = 1.5;
  return Math.exp(Math.pow(value - gaussianMean, 2) / (-2 * variance)) / (Math.sqrt(variance) * Math.sqrt(2 * Math.PI));
}

function _normalizeFieldDistribution(data, field) {
  const sum = sumBy(data, field);
  for (const item of data) {
    item[field] /= sum;
  }
}
