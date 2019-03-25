export default function(schema) {

  const competenceResult = schema.competenceResults.create({
    name: 'Compétence 1.1',
    index: '1.1',
    totalSkillsCount: 10,
    testedSkillsCount: 9,
    validatedSkillsCount: 3,
  });
  return schema.campaignParticipationResults.create({
    totalSkillsCount: 10,
    testedSkillsCount: 9,
    validatedSkillsCount: 3,
    competenceResults: [competenceResult]
  });
}
