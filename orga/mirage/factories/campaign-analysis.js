import { Factory, trait } from 'miragejs';

export default Factory.extend({
  withTubeRecommendations: trait({
    afterCreate(campaignAnalysis, server) {
      const tubeRecommendation_1 = server.create('campaign-tube-recommendation', {
        areaColor: 'jaffa',
        competenceName: 'Competence A',
        competenceId: 'recCompA',
        tubeId: 'recTubeA',
        tubePracticalTitle: 'Tube A',
      });
      const tubeRecommendation_2 = server.create('campaign-tube-recommendation', {
        areaColor: 'emerald',
        competenceName: 'Competence B',
        competenceId: 'recCompB',
        tubeId: 'recTubeB',
        tubePracticalTitle: 'Tube B',
      });
      campaignAnalysis.campaignTubeRecommendations = [tubeRecommendation_1, tubeRecommendation_2];
    },
  }),

  withEmptyTubeRecommendations: trait({
    afterCreate(campaignAnalysis) {
      campaignAnalysis.campaignTubeRecommendations = [];
    },
  }),
});
