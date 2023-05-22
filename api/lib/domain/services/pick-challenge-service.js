import _ from 'lodash';
import hashInt from 'hash-int';
import * as pseudoRandom from '../../infrastructure/utils/pseudo-random.js';
const NON_EXISTING_ITEM = null;
const VALIDATED_STATUS = 'validé';

const pickChallenge = function ({ skills, randomSeed, locale }) {
  if (skills.length === 0) {
    return NON_EXISTING_ITEM;
  }
  const keyForSkill = Math.abs(hashInt(randomSeed));
  const keyForChallenge = Math.abs(hashInt(randomSeed + 1));
  const chosenSkill = skills[keyForSkill % skills.length];

  return _pickLocaleChallengeAtIndex(chosenSkill.challenges, locale, keyForChallenge);
};

const chooseNextChallenge = function ({ possibleChallenges, assessmentId }) {
  const PROBABILITY_TO_BE_PICKED = 51;
  const pseudoRandomContext = pseudoRandom.create(assessmentId);

  const challengeIndex = pseudoRandomContext.binaryTreeRandom(PROBABILITY_TO_BE_PICKED, possibleChallenges.length);

  return possibleChallenges[challengeIndex];
};

export { pickChallenge, chooseNextChallenge };

function _pickLocaleChallengeAtIndex(challenges, locale, index) {
  const localeChallenges = _.filter(challenges, (challenge) => _.includes(challenge.locales, locale));
  const possibleChallenges = _findPreferablyValidatedChallenges(localeChallenges);
  return _.isEmpty(possibleChallenges) ? null : _pickChallengeAtIndex(possibleChallenges, index);
}

function _pickChallengeAtIndex(challenges, index) {
  return challenges[index % challenges.length];
}

function _findPreferablyValidatedChallenges(localeChallenges) {
  const validatedChallenges = _.filter(localeChallenges, (challenge) => challenge.status === VALIDATED_STATUS);
  return validatedChallenges.length > 0 ? validatedChallenges : localeChallenges;
}
