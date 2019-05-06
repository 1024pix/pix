export default function(schema, request) {
  const userId = request.params.id;

  const area1 = schema.areas.find(1);
  const area2 = schema.areas.find(2);

  const scorecardN1 = schema.scorecards.create({
    id: `${userId}_1`,
    name: 'Compétence C1',
    earnedPix: 3,
    level: 2,
    pixScoreAheadOfNextLevel: 3.2,
    area: area1,
    competenceId: 1,
  });
  const scorecardN2 = schema.scorecards.create({
    id: `${userId}_2`,
    name: 'Compétence C2',
    earnedPix: 7,
    level: 4,
    pixScoreAheadOfNextLevel: 7.2,
    area: area1,
    competenceId: 2,
  });
  const scorecardN3 = schema.scorecards.create({
    id: `${userId}_3`,
    name: 'Compétence C3',
    earnedPix: 10,
    level: 3,
    pixScoreAheadOfNextLevel: 5.36,
    area: area2,
    competenceId: 3,
  });

  const user = schema.users.find(userId);
  user.update('scorecards', [scorecardN1, scorecardN2, scorecardN3]);

  return user.scorecards;

}
