export default function (schema, request) {
  const { id } = request.params;

  let scorecard = schema.scorecards.find(id);

  if (!scorecard) {
    const area = schema.areas.find(4);

    scorecard = schema.scorecards.create({
      id,
      area,
      name: "Protéger la santé, le bien-être et l'environnement",
      description:
        'Appliquer des traitements à des données pour les analyser et les interpréter (avec un tableur, un programme, un logiciel de traitement d’enquête, une requête calcul dans une base de données, etc.).',
      earnedPix: 26,
      level: 3,
      pixScoreAheadOfNextLevel: 2,
      percentageAheadOfNextLevel: 90,
    });
  }

  return scorecard;
}
