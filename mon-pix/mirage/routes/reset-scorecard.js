export default function(schema, request) {
  const competenceId = request.params.competenceId;

  const scorecard = schema.scorecards.findBy({ competenceId });

  scorecard.update({
    status: 'NOT_STARTED',
    level: 0,
    earnedPix: 0,
    pixScoreAheadOfNextLevel: 0,
    remainingDaysBeforeReset: null,
  });

  return scorecard;
}
