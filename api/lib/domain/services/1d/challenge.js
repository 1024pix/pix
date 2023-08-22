import { NotFoundError } from '../../errors.js';

const getChallenge = async ({ missionId, activityLevel, challengeNumber, alternativeVersion, challengeRepository }) => {
  try {
    const challenges = await challengeRepository.getForPix1D({
      missionId,
      activityLevel,
      challengeNumber,
    });

    if (alternativeVersion) {
      return challenges.find((challenge) => challenge.alternativeVersion === alternativeVersion);
    } else {
      return challenges[_randomIndexForChallenges(challenges.length)];
    }
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
};

function _randomIndexForChallenges(length, random = Math.random()) {
  return Math.floor(random * length);
}

export const challengeService = { getChallenge };
