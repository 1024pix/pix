import { computeTubesFromSkills } from './../tube-service.js';
import * as catAlgorithm from './cat-algorithm.js';
import { getFilteredSkillsForFirstChallenge, getFilteredSkillsForNextChallenge } from './skills-filter.js';

export { getPossibleSkillsForNextChallenge };

const getPossibleSkillsForNextChallenge = ({
  knowledgeElements,
  challenges,
  targetSkills,
  lastAnswer,
  allAnswers,
  locale,
} = {}) => {
  const isUserStartingTheTest = !lastAnswer;
  const isLastChallengeTimed = lastAnswer ? wasLastChallengeTimed(lastAnswer) : false;
  const tubes = findTubes(targetSkills, challenges);
  const knowledgeElementsOfTargetSkills = knowledgeElements.filter((ke) => {
    return targetSkills.find((skill) => skill.id === ke.skillId);
  });
  const filteredChallenges = removeChallengesWithAnswer({ challenges, allAnswers });
  targetSkills = getSkillsWithAddedInformations({ targetSkills, filteredChallenges, locale });

  // First challenge has specific rules
  const { possibleSkillsForNextChallenge, levelEstimated } = isUserStartingTheTest
    ? findFirstChallenge({ knowledgeElements: knowledgeElementsOfTargetSkills, targetSkills, tubes })
    : findAnyChallenge({
        knowledgeElements: knowledgeElementsOfTargetSkills,
        targetSkills,
        tubes,
        isLastChallengeTimed,
      });

  // Test is considered finished when no challenges are returned but we don't expose this detail
  return possibleSkillsForNextChallenge.length > 0
    ? { hasAssessmentEnded: false, possibleSkillsForNextChallenge, levelEstimated }
    : { hasAssessmentEnded: true, possibleSkillsForNextChallenge, levelEstimated };
};

const wasLastChallengeTimed = (lastAnswer) => Boolean(lastAnswer.timeout);

const findTubes = (skills, challenges) => {
  const listSkillsWithChallenges = filterSkillsByChallenges(skills, challenges);
  return computeTubesFromSkills(listSkillsWithChallenges);
};

const filterSkillsByChallenges = (skills, challenges) => {
  const skillsWithChallenges = skills.filter((skill) => {
    return challenges.find((challenge) => challenge.skill.name === skill.name);
  });
  return skillsWithChallenges;
};

const findAnyChallenge = ({ knowledgeElements, targetSkills, tubes, isLastChallengeTimed }) => {
  const predictedLevel = catAlgorithm.getPredictedLevel(knowledgeElements, targetSkills);
  const availableSkills = getFilteredSkillsForNextChallenge({
    knowledgeElements,
    tubes,
    predictedLevel,
    isLastChallengeTimed,
    targetSkills,
  });
  const maxRewardingSkills = catAlgorithm.findMaxRewardingSkills({
    availableSkills,
    predictedLevel,
    tubes,
    knowledgeElements,
  });
  return { possibleSkillsForNextChallenge: maxRewardingSkills, levelEstimated: predictedLevel };
};

const findFirstChallenge = ({ knowledgeElements, targetSkills, tubes }) => {
  const filteredSkillsForFirstChallenge = getFilteredSkillsForFirstChallenge({
    knowledgeElements,
    tubes,
    targetSkills,
  });
  return { possibleSkillsForNextChallenge: filteredSkillsForFirstChallenge, levelEstimated: 2 };
};

const getSkillsWithAddedInformations = ({ targetSkills, filteredChallenges, locale }) =>
  targetSkills.map((skill) => {
    const challenges = filteredChallenges.filter(
      (challenge) => challenge.skill.id === skill.id && challenge.locales.includes(locale),
    );
    const [firstChallenge] = challenges;
    const skillCopy = Object.create(skill);
    return Object.assign(skillCopy, {
      challenges,
      timed: firstChallenge ? firstChallenge.isTimed() : false,
      isPlayable: !!firstChallenge,
    });
  });

const removeChallengesWithAnswer = ({ challenges, allAnswers }) => {
  const challengeIdsWithAnswer = allAnswers.map((answer) => answer.challengeId);
  return challenges.filter((challenge) => !challengeIdsWithAnswer.includes(challenge.id));
};
