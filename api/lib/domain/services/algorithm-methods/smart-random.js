import _ from 'lodash';
import * as catAlgorithm from './cat-algorithm.js';
import { getFilteredSkillsForFirstChallenge, getFilteredSkillsForNextChallenge } from './skills-filter.js';
import { computeTubesFromSkills } from './../tube-service.js';

export { getPossibleSkillsForNextChallenge };

function getPossibleSkillsForNextChallenge({
  knowledgeElements,
  challenges,
  targetSkills,
  lastAnswer,
  allAnswers,
  locale,
} = {}) {
  console.info('=============== Début ===============');

  console.info('Skills visés');

  console.info(targetSkills);

  console.info('Challenges');

  console.info(challenges);

  console.info("Réponses de l'utilisateur");

  console.info(allAnswers);

  const isUserStartingTheTest = !lastAnswer;

  console.info(`L'utilisateur vient de commencer? ${isUserStartingTheTest ? 'oui' : 'non'}`);

  const isLastChallengeTimed = _wasLastChallengeTimed(lastAnswer);

  console.info(`Le dernier challenge était timé ? ${isLastChallengeTimed ? 'oui' : 'non'}`);

  const tubes = _findTubes(targetSkills, challenges);

  console.info('Sujets de la compétence ou campagne:');

  console.info(tubes);

  const knowledgeElementsOfTargetSkills = knowledgeElements.filter((ke) => {
    return targetSkills.find((skill) => skill.id === ke.skillId);
  });

  console.info(`ke de l'utilisateur sur ces acquis`);

  console.info(knowledgeElementsOfTargetSkills);

  const filteredChallenges = _removeChallengesWithAnswer({ challenges, allAnswers });

  console.info("Challenges filtrés sans les réponses de l'utilisateur");

  console.info(filteredChallenges);

  targetSkills = _getSkillsWithAddedInformations({ targetSkills, filteredChallenges, locale });

  console.info('Acquis avec données enrichies');

  console.info(targetSkills);

  // First challenge has specific rules
  const { possibleSkillsForNextChallenge, levelEstimated } = isUserStartingTheTest
    ? _findFirstChallenge({ knowledgeElements: knowledgeElementsOfTargetSkills, targetSkills, tubes })
    : _findAnyChallenge({
        knowledgeElements: knowledgeElementsOfTargetSkills,
        targetSkills,
        tubes,
        isLastChallengeTimed,
      });

  // Test is considered finished when no challenges are returned but we don't expose this detail
  return possibleSkillsForNextChallenge.length > 0
    ? { hasAssessmentEnded: false, possibleSkillsForNextChallenge, levelEstimated }
    : { hasAssessmentEnded: true, possibleSkillsForNextChallenge, levelEstimated };
}

function _wasLastChallengeTimed(lastAnswer) {
  return _.get(lastAnswer, 'timeout') === null ? false : true;
}

function _findTubes(skills, challenges) {
  const listSkillsWithChallenges = _filterSkillsByChallenges(skills, challenges);
  return computeTubesFromSkills(listSkillsWithChallenges);
}

function _filterSkillsByChallenges(skills, challenges) {
  return skills.filter((skill) => {
    return challenges.find((challenge) => challenge.skill.name === skill.name);
  });
}

function _findAnyChallenge({ knowledgeElements, targetSkills, tubes, isLastChallengeTimed }) {
  const predictedLevel = catAlgorithm.getPredictedLevel(knowledgeElements, targetSkills);

  console.info(`Niveau estimé de l'utilisateur: ${predictedLevel}`);

  const availableSkills = getFilteredSkillsForNextChallenge({
    knowledgeElements,
    tubes,
    predictedLevel,
    isLastChallengeTimed,
    targetSkills,
  });

  console.info('Acquis filtrés pour le prochain challenge');

  console.info(availableSkills);

  const maxRewardingSkills = catAlgorithm.findMaxRewardingSkills({
    availableSkills,
    predictedLevel,
    tubes,
    knowledgeElements,
  });

  console.info('Acquis les plus intéressants pour le prochain challenge');

  console.info(maxRewardingSkills);

  return { possibleSkillsForNextChallenge: maxRewardingSkills, levelEstimated: predictedLevel };
}

function _findFirstChallenge({ knowledgeElements, targetSkills, tubes }) {
  const filteredSkillsForFirstChallenge = getFilteredSkillsForFirstChallenge({
    knowledgeElements,
    tubes,
    targetSkills,
  });
  return { possibleSkillsForNextChallenge: filteredSkillsForFirstChallenge, levelEstimated: 2 };
}

function _getSkillsWithAddedInformations({ targetSkills, filteredChallenges, locale }) {
  return _.map(targetSkills, (skill) => {
    const challenges = _.filter(
      filteredChallenges,
      (challenge) => challenge.skill.id === skill.id && challenge.locales.includes(locale),
    );
    const [firstChallenge] = challenges;
    const skillCopy = Object.create(skill);
    return Object.assign(skillCopy, {
      challenges,
      linkedSkills: firstChallenge ? _.reject(firstChallenge.skills, { id: skill.id }) : [],
      timed: firstChallenge ? firstChallenge.isTimed() : false,
      isPlayable: !!firstChallenge,
    });
  });
}

function _removeChallengesWithAnswer({ challenges, allAnswers }) {
  const challengeIdsWithAnswer = allAnswers.map((answer) => answer.challengeId);
  return challenges.filter((challenge) => !_.includes(challengeIdsWithAnswer, challenge.id));
}
