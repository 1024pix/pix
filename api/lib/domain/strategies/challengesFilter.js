const _ = require('lodash');
const { pipe } = require('lodash/fp');

const MAX_LEVEL_TO_BE_AN_EASY_TUBE = 3;

module.exports = {
  filteredChallengeForFirstChallenge: filteredChallengesForFirstChallenge,
  filteredChallenges
};

function filteredChallengesForFirstChallenge({ challenges, knowledgeElements, tubes, targetProfile }) {
  return pipe(
    _removeUnpublishedChallenges,
    _removeChallengesThatAlreadyFullyTested.bind(null, knowledgeElements, targetProfile),
    _removeChallengesFromLowPriorityTubes.bind(null, tubes, knowledgeElements)
  )(challenges);
}

function filteredChallenges({ challenges, knowledgeElements, tubes, predictedLevel, lastChallenge, targetProfile }) {
  return pipe(
    _removeUnpublishedChallenges,
    _removeChallengesThatAlreadyFullyTested.bind(null, knowledgeElements, targetProfile),
    _removeTooHardChallenges.bind(null, predictedLevel),
    _removeTimedChallengesIfLastOneWasAlsoTimed.bind(null, lastChallenge),
    _removeChallengesFromLowPriorityTubes.bind(null, tubes, knowledgeElements)
  )(challenges);
}

function _removeUnpublishedChallenges(challenges) {
  return _.filter(challenges, (challenge) => challenge.isPublished());
}

function _removeChallengesThatAlreadyFullyTested(knowledgeElements, targetProfile, challenges) {
  return _.filter(challenges, (challenge) => !challenge.haveAllSkillsAlreadyBeenTested(knowledgeElements, targetProfile));
}

function _removeTooHardChallenges(predictedLevel, challenges) {
  return _.filter(challenges, (challenge) => !_isChallengeTooHard(challenge, predictedLevel));
}

function _isChallengeTooHard(challenge, predictedLevel) {
  return challenge.hardestSkill.difficulty - predictedLevel > 2;
}

function _removeTimedChallengesIfLastOneWasAlsoTimed(lastChallenge, challenges) {
  const untimedChallenges = _extractUntimedChallenge(challenges);
  const lastChallengeWasTimed = _isChallengeTimed(lastChallenge);
  const someRemainingChallengesAreNotTimed = untimedChallenges.length > 0;
  if (lastChallengeWasTimed && someRemainingChallengesAreNotTimed) {
    return untimedChallenges;
  }
  return challenges;
}

function _isChallengeTimed(lastChallenge) {
  return lastChallenge && lastChallenge.timer !== undefined;
}

function _extractUntimedChallenge(challenges) {
  return challenges.filter((challenge) => challenge.timer == undefined);
}

function _removeChallengesFromLowPriorityTubes(tubes, knowledgeElements, challenges) {
  const prioritySkills = _getPrioritySkills(tubes, knowledgeElements);
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

function _getEasyTubes(tubes) {
  return _.filter(tubes, (tube) => tube.getHardestSkill().difficulty <= MAX_LEVEL_TO_BE_AN_EASY_TUBE);
}

function _getSkillsFromTubes(tubes) {
  return _.flatMap(tubes, (tube) => tube.skills);
}

function _getUntestedSkills(knowledgeElements, skills) {
  return _.filter(skills, (skill) => !_skillAlreadyTested(skill, knowledgeElements));
}

function _skillAlreadyTested(skill, knowledgeElements) {
  const alreadyTestedSkillIds = _.map(knowledgeElements, 'skillId');
  return alreadyTestedSkillIds.includes(skill.id);
}

function _removeChallengesThatDontTestRequiredSkills(challenges, requiredSkills) {
  return _.filter(challenges, (challenge) => challenge.hasAtLeastOneSkillTested(requiredSkills));
}

