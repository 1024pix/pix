import { Factory, trait } from 'ember-cli-mirage';

export default Factory.extend({

  withCompetenceCollectiveResults: trait({
    afterCreate(campaignCollectiveResult, server) {
      const competenceCollectiveResult_1 = server.create('campaign-competence-collective-result', {
        areaCode: '1',
        areaColor: 'jaffa',
        competenceName: 'Competence A',
        competenceId: 'recCompA',
        averageValidatedSkills: '5',
        totalSkillsCount: '10',
      });
      const competenceCollectiveResult_2 = server.create('campaign-competence-collective-result', {
        areaCode: '2',
        areaColor: 'emerald',
        competenceName: 'Competence B',
        competenceId: 'recCompB',
        averageValidatedSkills: '0',
        totalSkillsCount: '34',
      });
      campaignCollectiveResult.campaignCompetenceCollectiveResults = [competenceCollectiveResult_1, competenceCollectiveResult_2];
    }
  }),

  withTubeCollectiveResults: trait({
    afterCreate(campaignCollectiveResult, server) {
      const tubeCollectiveResult_1 = server.create('campaign-tube-collective-result', {
        tubePracticalTitle: 'Sujet A',
        tubeId: 'recTubeA',
        averageValidatedSkills: '5',
        totalSkillsCount: '10',
      });
      const tubeCollectiveResult_2 = server.create('campaign-tube-collective-result', {
        tubePracticalTitle: 'Sujet B',
        TubeId: 'recTubeB',
        averageValidatedSkills: '0',
        totalSkillsCount: '34',
      });
      campaignCollectiveResult.campaignTubeCollectiveResults = [tubeCollectiveResult_1, tubeCollectiveResult_2];
    }
  })

});
