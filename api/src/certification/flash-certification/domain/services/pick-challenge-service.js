import _ from 'lodash';
import hashInt from 'hash-int';
import { random } from '../../../../../lib/infrastructure/utils/random.js';
import { config } from '../../../../../lib/config.js';
const NON_EXISTING_ITEM = null;
const VALIDATED_STATUS = 'validé';

const pickChallenge = function ({ skills, randomSeed, locale }) {
  if (skills.length === 0) {
    return NON_EXISTING_ITEM;
  }
  const keyForSkill = Math.abs(hashInt(randomSeed));
  const keyForChallenge = Math.abs(hashInt(randomSeed + 1));
  const chosenSkill = skills[keyForSkill % skills.length];

  console.info('Acquis choisi plus ou moins au hasard: ', chosenSkill.name);

  console.info(
    'Cet acquis contient les challenges: ',
    chosenSkill.challenges.map((challenge) => ({
      id: challenge.id,
      status: challenge.status,
      locales: challenge.locales,
    })),
  );

  const result = _pickLocaleChallengeAtIndex(chosenSkill.challenges, locale, keyForChallenge);

  console.info('Challenge choisi plus ou moins au hasard: ', result);

  return result;
};

const chooseNextChallenge = function (
  probabilityToPickChallenge = config.v3Certification.defaultProbabilityToPickChallenge,
) {
  return function ({ possibleChallenges }) {
    const challengeIndex = random.binaryTreeRandom(probabilityToPickChallenge, possibleChallenges.length);

    return possibleChallenges[challengeIndex];
  };
};

export const pickChallengeService = { pickChallenge, chooseNextChallenge };

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
