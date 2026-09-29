import { fallbackChallengeLocales } from '../../../../shared/domain/services/locale-service.js';
import { STEPS_NAMES } from '../../models/SmartRandomStep.js';
import { logStep } from '../smart-random-log-service.js';
import { computeTubesFromSkills } from '../tube-service.js';
import * as catAlgorithm from './cat-algorithm.js';
import { getFilteredSkillsForFirstChallenge, getFilteredSkillsForNextChallenge } from './skills-filter.js';

/**
 * @typedef {import('../../models/SmartRandomChallenge.js').SmartRandomChallenge} SmartRandomChallenge
 * @typedef {import('../../../../shared/domain/models/Challenge.js').Challenge} SharedChallenge
 */

/**
 *
 * @param {object} params
 * @param {KnowledgeState} params.knowledgeState
 * @param {SmartRandomChallenge[]|SharedChallenge[]} params.challenges
 * @param {Skill[]} params.targetSkills
 * @param {Answer} params.lastAnswer
 * @param {Answer[]} params.allAnswers
 * @param {string} locale
 * @returns {{hasAssessmentEnded: boolean, possibleSkillsForNextChallenge: SmartRandomChallenge|SharedChallenge, levelEstimated: number}}
 */
export function getPossibleSkillsForNextChallenge({
  knowledgeState,
  challenges,
  targetSkills,
  lastAnswer,
  allAnswers,
  locale,
}) {
  const isUserStartingTheTest = !lastAnswer;
  const isLastChallengeTimed = lastAnswer ? wasLastChallengeTimed(lastAnswer) : false;
  const tubes = findTubes(targetSkills, challenges);
  const knowledgeStateOfTargetSkills = knowledgeState.restrictedTo(targetSkills);
  const filteredChallenges = removeChallengesWithAnswer({ challenges, allAnswers });
  targetSkills = getSkillsWithAddedInformations({ targetSkills, filteredChallenges, locale });

  // First challenge has specific rules
  const { possibleSkillsForNextChallenge, levelEstimated } = isUserStartingTheTest
    ? findFirstChallenge({ knowledgeState: knowledgeStateOfTargetSkills, targetSkills, tubes })
    : findAnyChallenge({
        knowledgeState: knowledgeStateOfTargetSkills,
        targetSkills,
        tubes,
        isLastChallengeTimed,
      });

  // Test is considered finished when no challenges are returned, but we don't expose this detail
  return possibleSkillsForNextChallenge.length > 0
    ? { hasAssessmentEnded: false, possibleSkillsForNextChallenge, levelEstimated }
    : { hasAssessmentEnded: true, possibleSkillsForNextChallenge, levelEstimated };
}

function wasLastChallengeTimed(lastAnswer) {
  return Boolean(lastAnswer.timeout);
}

function findTubes(skills, challenges) {
  const listSkillsWithChallenges = filterSkillsByChallenges(skills, challenges);
  return computeTubesFromSkills(listSkillsWithChallenges);
}

function filterSkillsByChallenges(skills, challenges) {
  return skills.filter((skill) => {
    return challenges.find((challenge) => challenge.skillId === skill.id);
  });
}

function findAnyChallenge({ knowledgeState, targetSkills, tubes, isLastChallengeTimed }) {
  const predictedLevel = catAlgorithm.getPredictedLevel(knowledgeState);
  const { availableSkills } = getFilteredSkillsForNextChallenge({
    knowledgeState,
    tubes,
    predictedLevel,
    isLastChallengeTimed,
    targetSkills,
  });
  const maxRewardingSkills = catAlgorithm.findMaxRewardingSkills({
    availableSkills,
    predictedLevel,
    tubes,
    knowledgeState,
  });

  logStep(STEPS_NAMES.MAX_REWARDING_SKILLS, maxRewardingSkills);

  return { possibleSkillsForNextChallenge: maxRewardingSkills, levelEstimated: predictedLevel };
}

function findFirstChallenge({ knowledgeState, targetSkills, tubes }) {
  const { availableSkills } = getFilteredSkillsForFirstChallenge({
    knowledgeState,
    tubes,
    targetSkills,
  });
  return { possibleSkillsForNextChallenge: availableSkills, levelEstimated: 2 };
}

function getSkillsWithAddedInformations({ targetSkills, filteredChallenges, locale }) {
  const locales = fallbackChallengeLocales(locale);

  return targetSkills.map((skill) => {
    const challenges = filteredChallenges.filter(
      (challenge) => challenge.skillId === skill.id && challenge.locales.some((locale) => locales.includes(locale)),
    );
    const [firstChallenge] = challenges;

    skill.challenges = challenges;
    skill.timed = firstChallenge ? firstChallenge.isTimed() : false;
    skill.isPlayable = !!firstChallenge;

    return skill;
  });
}

function removeChallengesWithAnswer({ challenges, allAnswers }) {
  const challengeIdsWithAnswer = allAnswers.map((answer) => answer.challengeId);
  return challenges.filter((challenge) => !challengeIdsWithAnswer.includes(challenge.id));
}
