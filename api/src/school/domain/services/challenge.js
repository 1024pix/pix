import { NotFoundError } from '../../../../lib/domain/errors.js';

async function getChallenge({
  missionId,
  activityLevel,
  challengeNumber,
  alternativeVersion,
  challengeRepository,
  locale,
}) {
  try {
    const challenges = await challengeRepository.getChallengeFor1d({
      missionId,
      activityLevel,
      challengeNumber,
      locale,
    });
    const challengeForSelectedAltVersion = challenges.find(
      (challenge) => challenge.alternativeVersion === alternativeVersion,
    );
    if (challengeForSelectedAltVersion === undefined) {
      return challenges[0];
    }
    return challengeForSelectedAltVersion;
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
}

async function getAlternativeVersion({
  missionId,
  activityLevel,
  alreadyPlayedAlternativeVersions,
  challengeRepository,
  locale,
}) {
  const activityChallenges = await challengeRepository.getActivityChallengesFor1d({
    missionId,
    activityLevel,
    locale,
  });
  let challengeWithMaxNumberOfVersions = activityChallenges[0];
  for (const challengeAlternatives of activityChallenges) {
    if (challengeAlternatives.length > challengeWithMaxNumberOfVersions.length) {
      challengeWithMaxNumberOfVersions = challengeAlternatives;
    }
  }
  const neverPlayedVersions = challengeWithMaxNumberOfVersions.filter(
    (challenge) => !alreadyPlayedAlternativeVersions.includes(challenge.alternativeVersion),
  );
  if (neverPlayedVersions.length === 0) {
    return challengeWithMaxNumberOfVersions[_randomIndexForChallenges(challengeWithMaxNumberOfVersions.length)]
      .alternativeVersion;
  }
  return neverPlayedVersions[_randomIndexForChallenges(neverPlayedVersions.length)].alternativeVersion;
}

function _randomIndexForChallenges(length, random = Math.random()) {
  return Math.floor(random * length);
}

export const challengeService = { getChallenge, getAlternativeVersion };
