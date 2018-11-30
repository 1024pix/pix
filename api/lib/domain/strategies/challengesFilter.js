const LEVEL_MAX_TO_BE_AN_EASY_TUBE = 3;
const _ = require('lodash');

module.exports = {

  filteredChallengeForFirstChallenge({ challenges, knowledgeElements, tubes, targetProfile }) {
    // Filter 1 : only available challenge : published and with skills not already tested
    let availableChallenges = challenges.filter((challenge) => _isAnAvailableChallenge(challenge, knowledgeElements, targetProfile));

    // Filter 4 : Priority to tubes with max level equal to LEVEL_MAX_TO_BE_AN_EASY_TUBE
    const listOfSkillsToTargetInPriority = _skillsToTargetInPriority(tubes, knowledgeElements);
    if (listOfSkillsToTargetInPriority.length > 0) {
      availableChallenges = _filterChallengesBySkills(availableChallenges, listOfSkillsToTargetInPriority);
    }

    return availableChallenges;
  },

  filteredChallenges({ challenges, knowledgeElements, tubes, predictedLevel, lastChallenge, targetProfile }) {
    // Filter 1 : only available challenge : published and with skills not already tested
    let availableChallenges = challenges.filter((challenge) => _isAnAvailableChallenge(challenge, knowledgeElements, targetProfile));

    // Filter 3 : Do not ask challenge where level too high
    availableChallenges = availableChallenges.filter((challenge) => _isChallengeNotTooHard(challenge, predictedLevel));

    // Filter 2 : Do not ask timed challenge if previous challenge was timed
    if (_isPreviousChallengeTimed(lastChallenge)) {
      const challengesFilterByNotTimed =_extractNotTimedChallenge(availableChallenges);
      if(challengesFilterByNotTimed.length > 0) {
        availableChallenges = challengesFilterByNotTimed;
      }
    }

    // Filter 4 : Priority to tubes with max level equal to LEVEL_MAX_TO_BE_AN_EASY_TUBE
    const listOfSkillsToTargetInPriority = _skillsToTargetInPriority(tubes, knowledgeElements);
    if (listOfSkillsToTargetInPriority.length > 0) {
      availableChallenges = _filterChallengesBySkills(availableChallenges, listOfSkillsToTargetInPriority);
    }

    return availableChallenges;
  }
};

function _isChallengeNotTooHard(challenge, predictedLevel) {
  return challenge.hardestSkill.difficulty - predictedLevel <= 2;
}

function _isAnAvailableChallenge(challenge, knowledgeElements, targetProfile) {
  return challenge.isPublished()
    && !challenge.hasAllSkilledAlreadyCovered(knowledgeElements, targetProfile);
}

function _isPreviousChallengeTimed(lastChallenge) {
  return lastChallenge && (lastChallenge.timer !== undefined);
}

function _extractNotTimedChallenge(availableChallenges) {
  return availableChallenges.filter((challenge) => challenge.timer == undefined);
}

function _skillsToTargetInPriority(courseTubes, knowledgesElements) {
  let skillsToTargetInPriority = [];

  for (const tube in courseTubes) {
    const listOfSkillsForThisTube = courseTubes[tube].skills;

    const mostDifficultSkill = listOfSkillsForThisTube.sort((a, b) => a.difficulty < b.difficulty)[0];

    if (mostDifficultSkill.difficulty <= LEVEL_MAX_TO_BE_AN_EASY_TUBE) {

      const nbSkillsNotEvaluated = listOfSkillsForThisTube.filter((skill) => {
        return _skillNotKnownYet(skill, knowledgesElements);
      }).length;

      if (nbSkillsNotEvaluated !== 0) {
        skillsToTargetInPriority = skillsToTargetInPriority.concat(courseTubes[tube].skills);
      }
    }
  }

  return skillsToTargetInPriority;
}

function _skillNotKnownYet(skill, knowledgesElements) {
  const skillsAlreadyTested = _.map(knowledgesElements,'skillId');
  return !skillsAlreadyTested.includes(skill.id);
}

function _filterChallengesBySkills(listOfChallenges, listOfRequiredSkills) {

  return listOfChallenges.filter((challenge) => {

    let challengeContainsSkillsInTargetProfile = false;

    listOfRequiredSkills.map((skill) => skill.name).forEach((skillName) => {
      const challengeHasSkill = challenge.skills.map((skill) => skill.name).includes(skillName);
      if (challengeHasSkill) {
        challengeContainsSkillsInTargetProfile = true;
      }
    });

    return challengeContainsSkillsInTargetProfile;
  });
}
