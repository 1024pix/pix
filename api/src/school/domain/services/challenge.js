export const challengeService = { getAlternativeVersion };

function getAlternativeVersion({ mission, activities, activityInfo }) {
  const alreadyPlayedAlternativeVersions = activities
    .filter((activity) => activity.level === activityInfo.level)
    .map((activity) => activity.alternativeVersion);

  const activityChallengeIds = mission.getChallengeIds(activityInfo);
  let challengeWithMaxNumberOfVersions = activityChallengeIds[0] ?? [];

  for (const challengeAlternativeIds of activityChallengeIds) {
    if (challengeAlternativeIds.length > challengeWithMaxNumberOfVersions.length) {
      challengeWithMaxNumberOfVersions = challengeAlternativeIds;
    }
  }

  const challengeIndexWithMaxNumberOfVersions = challengeWithMaxNumberOfVersions.map((_, index) => index);

  const neverPlayedVersionIndexes = challengeIndexWithMaxNumberOfVersions.filter(
    (alternativeVersionNumber) => !alreadyPlayedAlternativeVersions.includes(alternativeVersionNumber),
  );

  if (neverPlayedVersionIndexes.length === 0) {
    return challengeIndexWithMaxNumberOfVersions[
      _randomIndexForChallenges(challengeIndexWithMaxNumberOfVersions.length)
    ];
  }
  return neverPlayedVersionIndexes[_randomIndexForChallenges(neverPlayedVersionIndexes.length)];
}

function _randomIndexForChallenges(length, random = Math.random()) {
  return Math.floor(random * length);
}
