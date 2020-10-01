const _ = require('lodash');
const hashInt = require('hash-int');
const { FRENCH_FRANCE, FRENCH_SPOKEN } = require('../constants').LOCALE;
const UNEXISTING_ITEM = null;
const VALIDATED_STATUSES = ['validé', 'validé sans test', 'pré-validé'];

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
  const possibleChallenges = _findPreferablyValidatedChallenges(localeChallenges, locale)
  return _.isEmpty(possibleChallenges) ? null : _pickChallengeAtIndex(possibleChallenges, index);
}

function _pickChallengeAtIndex(challenges, index) {
  return challenges[index % challenges.length];
}

function _findPreferablyValidatedChallenges(localeChallenges) {
  const validatedChallenges = _.filter(localeChallenges, ((challenge) => _.includes(VALIDATED_STATUSES, challenge.status)));
  return validatedChallenges.length > 0 ? validatedChallenges : localeChallenges;
}
