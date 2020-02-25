export default function(schema) {

  const competenceResult = schema.competenceResults.create({
    name: 'Compétence 1.1',
    index: '1.1',
    totalSkillsCount: 10,
    testedSkillsCount: 9,
    validatedSkillsCount: 9,
  });

  const badge = schema.badges.create({
    altMessage: 'Yon won a Pix Emploi badge',
    imageUrl: '/images/badges/Pix-emploi.svg',
    message: 'Congrats, you won a Pix Emploi badge',
  });

  return schema.campaignParticipationResults.create({
    totalSkillsCount: 10,
    testedSkillsCount: 9,
    validatedSkillsCount: 9,
    competenceResults: [competenceResult],
    badge
  });
}
