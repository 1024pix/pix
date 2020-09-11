const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-analysis-serializer');

describe('Unit | Serializer | JSONAPI | campaign-analysis-serializer', () => {

  describe('#serialize', () => {

    it('should return a serialized JSON data object', () => {
      // given
      const campaignId = 123;

      const campaignAnalysis = {
        id: campaignId,
        campaignTubeRecommendations: [
          {
            id: '123_tubeRec1',
            tubeId: 'tubeRec1',
            competenceId: 'rec1',
            competenceName: 'Cuisson des legumes d’automne',
            tubePracticalTitle: 'Savoir cuisiner des legumes d’automne à la perfection',
            areaColor: 'jaffa',
            averageScore: 11,
            tutorials: [{
              id: 'recTutorial1',
              duration: '00:03:30',
              format: 'video',
              link: 'https://youtube.fr',
              source: 'Youtube',
              title: 'Savoir regarder des vidéos youtube.',
            }],
          },
        ],
      };

      const expectedSerializedResult = {
        data: {
          id: '123',
          type: 'campaign-analyses',
          attributes: {},
          relationships: {
            'campaign-tube-recommendations': {
              data: [{
                id: '123_tubeRec1',
                type: 'campaignTubeRecommendations',
              }],
            },
          },
        },
        included: [{
          id: 'recTutorial1',
          type: 'tutorials',
          attributes: {
            id: 'recTutorial1',
            duration: '00:03:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Savoir regarder des vidéos youtube.',
          },
        }, {
          id: '123_tubeRec1',
          type: 'campaignTubeRecommendations',
          attributes: {
            'competence-id': 'rec1',
            'tube-id': 'tubeRec1',
            'competence-name': 'Cuisson des legumes d’automne',
            'tube-practical-title': 'Savoir cuisiner des legumes d’automne à la perfection',
            'area-color': 'jaffa',
            'average-score': 11,
          },
          relationships: {
            tutorials: {
              data: [
                {
                  id: 'recTutorial1',
                  type: 'tutorials',
                },
              ],
            },
          },
        }],
      };

      // when
      const result = serializer.serialize(campaignAnalysis);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
