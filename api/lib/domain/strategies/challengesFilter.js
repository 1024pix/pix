const _ = require('lodash');
const { pipe } = require('lodash/fp');

const MAX_LEVEL_TO_BE_AN_EASY_TUBE = 3;

module.exports = {
  filteredChallengesForFirstChallenge,
  filteredChallenges
};

function filteredChallengesForFirstChallenge({ challenges, knowledgeElements, courseTubes, targetSkills }) {
  return pipe(
    _removeUnpublishedChallenges,
    _removeChallengesAlreadyFullyTested.bind(null, knowledgeElements, targetSkills),
    _removeChallengesFromLowPriorityTubes.bind(null, courseTubes, knowledgeElements)
  )(challenges);
}

function filteredChallenges({ challenges, knowledgeElements, courseTubes, predictedLevel, lastChallenge, targetSkills }) {
  return pipe(
    _removeUnpublishedChallenges,
    _removeChallengesAlreadyFullyTested.bind(null, knowledgeElements, targetSkills),
    _removeTooHardChallenges.bind(null, predictedLevel),
    _removeTimedChallengesIfLastOneWasAlsoTimed.bind(null, lastChallenge),
    _removeChallengesFromLowPriorityTubes.bind(null, courseTubes, knowledgeElements)
  )(challenges);
}

function _removeUnpublishedChallenges(challenges) {
  return _.filter(challenges, (challenge) => challenge.isPublished());
}

function _removeChallengesAlreadyFullyTested(knowledgeElements, targetSkills, challenges) {
  return _.filter(challenges, (challenge) => !challenge.haveAllSkillsAlreadyBeenTested(knowledgeElements, targetSkills));
}

function _removeTooHardChallenges(predictedLevel, challenges) {
  return _.filter(challenges, (challenge) => !_isChallengeTooHard(challenge, predictedLevel));
}

function _isChallengeTooHard(challenge, predictedLevel) {
  return challenge.hardestSkill.difficulty - predictedLevel > 2;
}

function _removeTimedChallengesIfLastOneWasAlsoTimed(lastChallenge, challenges) {
  const untimedChallenges = _extractUntimedChallenge(challenges);
  const lastChallengeWasTimed = lastChallenge.isTimed();
  const someRemainingChallengesAreNotTimed = untimedChallenges.length > 0;
  if (lastChallengeWasTimed && someRemainingChallengesAreNotTimed) {
    return untimedChallenges;
  }
  return challenges;
}

function _extractUntimedChallenge(challenges) {
  return challenges.filter((challenge) => !challenge.isTimed());
}

function _removeChallengesFromLowPriorityTubes(courseTubes, knowledgeElements, challenges) {
  const prioritySkills = _getPrioritySkills(courseTubes, knowledgeElements);
  if (prioritySkills.length > 0) {
    const challengesFromEasyTubes = _removeChallengesThatDontTestRequiredSkills(challenges, prioritySkills);
    if(challengesFromEasyTubes.length > 0) {
      return challengesFromEasyTubes;
    }
  }
  return challenges;
}

function _getPrioritySkills(courseTubes, knowledgeElements) {
  return pipe(
    _getEasyTubes,
    _getSkillsFromTubes,
    _getUntestedSkills.bind(null, knowledgeElements)
  )(courseTubes);
}

function _getEasyTubes(courseTubes) {
  return _.filter(courseTubes, (tube) => tube.getHardestSkill().difficulty <= MAX_LEVEL_TO_BE_AN_EASY_TUBE);
}

function _getSkillsFromTubes(courseTubes) {
  return _.flatMap(courseTubes, (tube) => tube.skills);
}

function _getUntestedSkills(knowledgeElements, skills) {
  return _.filter(skills, (skill) => !_isSkillAlreadyTested(skill, knowledgeElements));
}

function _isSkillAlreadyTested(skill, knowledgeElements) {
  const alreadyTestedSkillIds = _.map(knowledgeElements, 'skillId');
  return alreadyTestedSkillIds.includes(skill.id);
}

function _removeChallengesThatDontTestRequiredSkills(challenges, requiredSkills) {
  return _.filter(challenges, (challenge) => challenge.hasAtLeastOneSkillTested(requiredSkills));
}

