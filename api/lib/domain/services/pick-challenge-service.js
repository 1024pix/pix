const _ = require('lodash');
const hashInt = require('hash-int');
const config = require('../../config');
const UNEXISTING_ITEM = null;

module.exports = {
  pickChallenge({ skills, randomSeed, locale }) {
    if (skills.length === 0) {
      return UNEXISTING_ITEM;
    }
    const key = Math.abs(hashInt(randomSeed));
    const chosenSkill = skills[key % skills.length];
    if (!config.locale.enabled) {
      return _pickChallengeAtIndex(chosenSkill.challenges, key);
    }
    const localeChallenges = _.filter(chosenSkill.challenges, ((challenge) => challenge.locale === locale));
    if (_.isEmpty(localeChallenges)) {
      return _pickChallengeAtIndex(chosenSkill.challenges, key);
    }
    return _pickChallengeAtIndex(localeChallenges, key);
  }
};

function _pickChallengeAtIndex(challenges, index) {
  return challenges[index % challenges.length];
}
