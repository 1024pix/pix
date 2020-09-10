import { Factory, trait } from 'ember-cli-mirage';

export default Factory.extend({
  withCompetenceResults: trait({
    afterCreate(campaignParticipationResult, server) {
      const competenceResult_1 = server.create('competence-result', {
        areaColor: 'jaffa',
        name: 'Competence A',
        index: '5.1',
        totalSkillsCount: 4,
        testedSkillsCount: 3,
        validatedSkillsCount: 2,
      });
      const competenceResult_2 = server.create('competence-result', {
        areaColor: 'emerald',
        name: 'Competence B',
        index: '3.2',
        totalSkillsCount: 10,
        testedSkillsCount: 10,
        validatedSkillsCount: 10,
      });
      campaignParticipationResult.competenceResults = [competenceResult_1, competenceResult_2];
    },
  }),
});
