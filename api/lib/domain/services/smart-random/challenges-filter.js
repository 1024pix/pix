const _ = require('lodash');
const { pipe } = require('lodash/fp');

const MAX_LEVEL_TO_BE_AN_EASY_TUBE = 3;
const DEFAULT_LEVEL_FOR_FIRST_CHALLENGE = 2;

module.exports = {
  getFilteredChallengesForFirstChallenge,
  getFilteredChallengesForAnyChallenge
};

function getFilteredChallengesForFirstChallenge({ challenges, knowledgeElements, courseTubes, targetSkills }) {
  return pipe(
    _removeUnpublishedChallenges,
    _removeChallengesThatAlreadyFullyTested.bind(null, knowledgeElements, targetSkills),
    _removeChallengesFromLowPriorityTubes.bind(null, courseTubes, knowledgeElements),
    _keepOnlyUntimedChallengeIfAny.bind(null),
    _keepOnlyChallengesOfMinimumEffectiveDifficulty.bind(null)
  )(challenges);
}

function getFilteredChallengesForAnyChallenge({ challenges, knowledgeElements, courseTubes, predictedLevel, lastChallenge, targetSkills }) {
  return pipe(
    _removeUnpublishedChallenges,
    _removeChallengesThatAlreadyFullyTested.bind(null, knowledgeElements, targetSkills),
    _removeTooHardChallenges.bind(null, predictedLevel),
    _removeTimedChallengesIfLastOneWasAlsoTimed.bind(null, lastChallenge),
    _removeChallengesFromLowPriorityTubes.bind(null, courseTubes, knowledgeElements)
  )(challenges);
}

function _removeUnpublishedChallenges(challenges) {
  return _.filter(challenges, (challenge) => challenge.isPublished());
}

function _removeChallengesThatAlreadyFullyTested(knowledgeElements, targetSkills, challenges) {
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
    if (challengesFromEasyTubes.length > 0) {
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
  return _.filter(skills, (skill) => !_skillAlreadyTested(skill, knowledgeElements));
}

function _skillAlreadyTested(skill, knowledgeElements) {
  const alreadyTestedSkillIds = _.map(knowledgeElements, 'skillId');
  return alreadyTestedSkillIds.includes(skill.id);
}

function _removeChallengesThatDontTestRequiredSkills(challenges, requiredSkills) {
  return _.filter(challenges, (challenge) => challenge.hasAtLeastOneSkillTested(requiredSkills));
}

function _keepOnlyUntimedChallengeIfAny(challenges) {
  const untimedChallenges = _.filter(challenges, (challenge) => !challenge.isTimed());
  if (!_.isEmpty(untimedChallenges)) {
    return untimedChallenges;
  }
  return challenges;
}

// A challenge of default level difficulty should be prioritized over all other levels. Hence, we remap
// the difficulty so it's effective difficulty is considered the lowerst possible
function _keepOnlyChallengesOfMinimumEffectiveDifficulty(challenges) {
  if (_.isEmpty(challenges)) {
    return challenges;
  }
  const remapDifficulty = (difficulty) => difficulty == DEFAULT_LEVEL_FOR_FIRST_CHALLENGE ? Number.MIN_VALUE : difficulty;
  const [, potentialFirstChallenges] = _(challenges)
    .groupBy('hardestSkill.difficulty')
    .entries()
    .minBy(([difficulty, _challenges]) => remapDifficulty(parseFloat(difficulty)));

  return potentialFirstChallenges;
}
