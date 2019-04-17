export default function(schema, request) {
  const { id } = request.params;

  let scorecard = schema.scorecards.find(id);

  if (!scorecard) {
    const area = schema.areas.find(4);

    scorecard = schema.scorecards.create({
      id,
      name: 'Protéger la santé, le bien-être et l\'environnement',
      area: area,
      earnedPix: 26,
      level: 3,
      remainingPixToNextLevel: 2,
    });
  }

  return scorecard;
}
