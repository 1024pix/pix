const FIRST_CHALLENGE_NB = 1;

async function getAllChallenges({ missionId, activityLevel, challengeRepository }) {
  const firstChallengesVersions = await challengeRepository.getChallengeFor1d({
    missionId,
    activityLevel,
    challengeNumber: FIRST_CHALLENGE_NB,
  });
  return [firstChallengesVersions];
}

export const activityChallengesService = { getAllChallenges };
