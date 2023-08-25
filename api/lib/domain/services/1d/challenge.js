import { NotFoundError } from '../../errors.js';

async function getChallenge({ missionId, activityLevel, challengeNumber, alternativeVersion, challengeRepository }) {
  return await _filterChallenges(
    { missionId, activityLevel, challengeNumber, challengeRepository },
    function (challenges) {
      if (alternativeVersion === 0) {
        alternativeVersion = undefined;
      }
      return challenges.find((challenge) => challenge.alternativeVersion === alternativeVersion);
    },
  );
}

async function getStartChallenge({ missionId, activityLevel, challengeNumber, challengeRepository }) {
  return await _filterChallenges(
    { missionId, activityLevel, challengeNumber, challengeRepository },
    function (challenges) {
      return challenges[_randomIndexForChallenges(challenges.length)];
    },
  );
}

const _filterChallenges = async (
  { missionId, activityLevel, challengeNumber, challengeRepository },
  filterFunction,
) => {
  try {
    const challenges = await challengeRepository.getForPix1D({
      missionId,
      activityLevel,
      challengeNumber,
    });
    return filterFunction(challenges);
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
};

function _randomIndexForChallenges(length, random = Math.random()) {
  return Math.floor(random * length);
}

export const challengeService = { getChallenge, getStartChallenge };
