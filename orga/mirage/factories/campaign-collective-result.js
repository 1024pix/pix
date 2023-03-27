import { Factory, trait } from 'miragejs';

export default Factory.extend({
  withCompetenceCollectiveResults: trait({
    afterCreate(campaignCollectiveResult, server) {
      const competenceCollectiveResult_1 = server.create('campaign-competence-collective-result', {
        areaCode: '1',
        areaColor: 'jaffa',
        competenceName: 'Competence A',
        competenceId: 'recCompA',
        averageValidatedSkills: '5',
        targetedSkillsCount: '10',
      });
      const competenceCollectiveResult_2 = server.create('campaign-competence-collective-result', {
        areaCode: '2',
        areaColor: 'emerald',
        competenceName: 'Competence B',
        competenceId: 'recCompB',
        averageValidatedSkills: '0',
        targetedSkillsCount: '34',
      });
      campaignCollectiveResult.campaignCompetenceCollectiveResults = [
        competenceCollectiveResult_1,
        competenceCollectiveResult_2,
      ];
    },
  }),
});
