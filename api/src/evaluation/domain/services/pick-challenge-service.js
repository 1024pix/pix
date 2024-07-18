import hashInt from 'hash-int';

import { config } from '../../../../src/shared/config.js';
import { random } from '../../../shared/infrastructure/utils/random.js';
const NON_EXISTING_ITEM = null;
const VALIDATED_STATUS = 'validé';

const pickChallenge = ({ skills, randomSeed, locale }) => {
  if (skills.length === 0) {
    return NON_EXISTING_ITEM;
  }
  const keyForSkill = Math.abs(hashInt(randomSeed));
  const keyForChallenge = Math.abs(hashInt(randomSeed + 1));
  const chosenSkill = skills[keyForSkill % skills.length];

  return pickLocaleChallengeAtIndex(chosenSkill.challenges, locale, keyForChallenge);
};

const chooseNextChallenge =
  (probabilityToPickChallenge = config.v3Certification.defaultProbabilityToPickChallenge) =>
  ({ possibleChallenges }) => {
    const challengeIndex = random.binaryTreeRandom(probabilityToPickChallenge, possibleChallenges.length);

    return possibleChallenges[challengeIndex];
  };

export const pickChallengeService = { pickChallenge, chooseNextChallenge };

const pickLocaleChallengeAtIndex = (challenges, locale, index) => {
  const localeChallenges = challenges.filter((challenge) => challenge.locales.includes(locale));
  const possibleChallenges = findPreferablyValidatedChallenges(localeChallenges);
  return possibleChallenges.length ? pickChallengeAtIndex(possibleChallenges, index) : null;
};

const pickChallengeAtIndex = (challenges, index) => challenges[index % challenges.length];

const findPreferablyValidatedChallenges = (localeChallenges) => {
  const validatedChallenges = localeChallenges.filter((challenge) => challenge.status === VALIDATED_STATUS);
  return validatedChallenges.length > 0 ? validatedChallenges : localeChallenges;
};
