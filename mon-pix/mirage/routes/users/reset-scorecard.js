import _ from 'lodash';

export default function(schema, request) {
  const competenceId = request.params.competenceId;
  const userId = request.params.userId;

  const userScorecards = schema.users.find(userId).scorecards.models;
  const scorecard = _.find(userScorecards, { competenceId });

  scorecard.update({
    status: 'NOT_STARTED',
    level: 0,
    earnedPix: 0,
    pixScoreAheadOfNextLevel: 0,
    remainingDaysBeforeReset: null,
  });

  return scorecard;
}
