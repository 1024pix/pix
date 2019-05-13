import { Factory, trait } from 'ember-cli-mirage';

export default Factory.extend({

  withCompetenceCollectiveResults: trait({
    afterCreate(campaignCollectiveResult, server) {
      const competenceCollectiveResult_1 = server.create('campaign-competence-collective-result', {
        domainCode: '1',
        competenceName: 'Competence A',
        competenceId: 'recCompA',
        averageValidatedSkills: '5',
        totalSkillsCount: '10',
      });
      const competenceCollectiveResult_2 = server.create('campaign-competence-collective-result', {
        domainCode: '2',
        competenceName: 'Competence B',
        competenceId: 'recCompB',
        averageValidatedSkills: '0',
        totalSkillsCount: '34',
      });
      campaignCollectiveResult.campaignCompetenceCollectiveResults = [competenceCollectiveResult_1, competenceCollectiveResult_2];
    }
  })

});
