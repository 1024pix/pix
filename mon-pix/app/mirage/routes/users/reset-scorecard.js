import find from 'lodash/find';

export default function (schema, request) {
  const competenceId = request.params.competenceId;
  const userId = request.params.id;

  const userScorecards = schema.users.find(userId).scorecards.models;
  const scorecard = find(userScorecards, { competenceId });

  scorecard.update({
    status: 'NOT_STARTED',
    level: 0,
    earnedPix: 0,
    pixScoreAheadOfNextLevel: 0,
    percentageAheadOfNextLevel: 100,
    isFinishedWithMaxLevel: false,
    isFinished: false,
    isNotStarted: true,
    isStarted: false,
    isMaxLevel: false,
    isProgressable: false,
    isImprovable: false,
    shouldWaitBeforeImproving: false,
    isResettable: false,
    hasNotEarnedAnything: false,
    hasNotReachedLevelOne: false,
    hasReachedAtLeastLevelOne: true,
    remainingPixToNextLevel: 6,
    remainingDaysBeforeReset: null,
    remainingDaysBeforeImproving: null,
  });

  return scorecard;
}
