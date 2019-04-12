export default function(schema, request) {
  const { id } = request.params;
  const area1 = schema.areas.find(4);

  let scorecard = schema.scorecards.find(id);

  if (!scorecard) {
    scorecard = schema.scorecards.create({
      id,
      name: 'Protéger la santé, le bien-être et l\'environnement',
      area: area1,
      earnedPix: 26,
      level: 3,
      pixScoreAheadOfNextLevel: 2,
    });
  }

  return scorecard;
}
