const _ = require('lodash');
const hashInt = require('hash-int');
const { FRENCH_FRANCE, FRENCH_SPOKEN } = require('../constants').LOCALE;
const UNEXISTING_ITEM = null;

module.exports = {
  pickChallenge({ skills, randomSeed, locale }) {
    if (skills.length === 0) {
      return UNEXISTING_ITEM;
    }
    const key = Math.abs(hashInt(randomSeed));
    const chosenSkill = skills[key % skills.length];

    return _pickLocaleChallengeAtIndex(chosenSkill.challenges, locale, key)
        || _pickLocaleChallengeAtIndex(chosenSkill.challenges, FRENCH_SPOKEN, key)
        || _pickLocaleChallengeAtIndex(chosenSkill.challenges, FRENCH_FRANCE, key);
  },
};

function _pickLocaleChallengeAtIndex(challenges, locale, index) {
  const localeChallenges = _.filter(challenges, ((challenge) => _.includes(challenge.locales, locale)));
  const challenge = _.isEmpty(localeChallenges) ? null : _pickChallengeAtIndex(localeChallenges, index);
  return challenge;
}

function _pickChallengeAtIndex(challenges, index) {
  return challenges[index % challenges.length];
}
