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
          }
        ]
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
              }]
            },
          },
        },
        included: [{
          id: '123_tubeRec1',
          type: 'campaignTubeRecommendations',
          attributes: {
            'competence-id': 'rec1',
            'tube-id': 'tubeRec1',
            'competence-name': 'Cuisson des legumes d’automne',
            'tube-practical-title': 'Savoir cuisiner des legumes d’automne à la perfection',
            'area-color': 'jaffa',
            'average-score': 11,

          }
        }]
      };

      // when
      const result = serializer.serialize(campaignAnalysis);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
