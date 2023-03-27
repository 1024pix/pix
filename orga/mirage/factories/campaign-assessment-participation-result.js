import { Factory, trait } from 'miragejs';

export default Factory.extend({
  withCompetenceResults: trait({
    afterCreate(campaignAssessmentParticipationResult, server) {
      const competenceResult_1 = server.create('campaign-assessment-participation-competence-result', {
        areaColor: 'jaffa',
        name: 'Competence A',
        index: '5.1',
        targetedSkillsCount: 4,
        testedSkillsCount: 3,
        validatedSkillsCount: 2,
      });
      const competenceResult_2 = server.create('campaign-assessment-participation-competence-result', {
        areaColor: 'emerald',
        name: 'Competence B',
        index: '3.2',
        targetedSkillsCount: 10,
        testedSkillsCount: 10,
        validatedSkillsCount: 10,
      });
      campaignAssessmentParticipationResult.competenceResults = [competenceResult_1, competenceResult_2];
    },
  }),
  withEmptyCompetenceResults: trait({
    afterCreate(campaignAssessmentParticipationResult) {
      campaignAssessmentParticipationResult.competenceResults = [];
    },
  }),
});
