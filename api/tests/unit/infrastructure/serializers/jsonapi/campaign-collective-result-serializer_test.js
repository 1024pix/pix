const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-collective-result-serializer');

describe('Unit | Serializer | JSONAPI | campaign-collective-results-serializer', () => {

  describe('#serialize', () => {

    it('should return a serialized JSON data object with campaign competence collective results', () => {
      // given
      const campaignId = 123;

      const campaignCollectiveResult = domainBuilder.buildCampaignCollectiveResult({
        id: campaignId,
        campaignCompetenceCollectiveResults: [
          domainBuilder.buildCampaignCompetenceCollectiveResult({
            averageValidatedSkills: 2,
            campaignId: campaignId,
            competenceId: 'rec1',
            competenceIndex: '1.2',
            competenceName: 'Cuisson des legumes d’automne',
            areaColor: 'jaffa',
            totalSkillsCount: 3,
          }),
          domainBuilder.buildCampaignCompetenceCollectiveResult({
            averageValidatedSkills: 1,
            campaignId: campaignId,
            competenceId: 'rec2',
            competenceIndex: '3.4',
            competenceName: 'Tourner un champignon',
            areaColor: 'cerulean',
            totalSkillsCount: 4,
          }),
        ]
      });

      const expectedSerializedResult = {
        data: {
          id: campaignId.toString(),
          type: 'campaign-collective-results',
          attributes: {},
          relationships: {
            'campaign-competence-collective-results': {
              data: [{
                id: `${campaignId.toString()}_rec1`,
                type: 'campaignCompetenceCollectiveResults',
              }, {
                id: `${campaignId.toString()}_rec2`,
                type: 'campaignCompetenceCollectiveResults',
              }]
            },
            'campaign-tube-collective-results': {
              data: []
            }
          },
        },
        included: [{
          id: '123_rec1',
          type: 'campaignCompetenceCollectiveResults',
          attributes: {
            'average-validated-skills': 2,
            'competence-id': 'rec1',
            'competence-name': 'Cuisson des legumes d’automne',
            'area-code': '1',
            'area-color': 'jaffa',
            'total-skills-count': 3,
          }
        }, {
          id: '123_rec2',
          type: 'campaignCompetenceCollectiveResults',
          attributes: {
            'average-validated-skills': 1,
            'competence-id': 'rec2',
            'competence-name': 'Tourner un champignon',
            'area-code': '3',
            'area-color': 'cerulean',
            'total-skills-count': 4,
          }
        }]
      };

      // when
      const result = serializer.serialize(campaignCollectiveResult);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });

    it('should return a serialized JSON data object with campaign tube collective results', () => {
      // given
      const campaignId = 123;

      const campaignCollectiveResult = domainBuilder.buildCampaignCollectiveResult({
        id: campaignId,
        campaignTubeCollectiveResults: [
          domainBuilder.buildCampaignTubeCollectiveResult({
            averageValidatedSkills: 2,
            campaignId: campaignId,
            competenceName: 'Competence C',
            tubeId: 'rec1',
            tubePracticalTitle: 'Cat',
            areaColor: 'jaffa',
            totalSkillsCount: 3,
          }),
          domainBuilder.buildCampaignTubeCollectiveResult({
            averageValidatedSkills: 1,
            campaignId: campaignId,
            competenceName: 'Competence C',
            tubeId: 'rec2',
            tubePracticalTitle: 'Dog',
            areaColor: 'cerulean',
            totalSkillsCount: 4,
          }),
        ]
      });

      const expectedSerializedResult = {
        data: {
          id: campaignId.toString(),
          type: 'campaign-collective-results',
          attributes: {},
          relationships: {
            'campaign-competence-collective-results': {
              data: []
            },
            'campaign-tube-collective-results': {
              data: [{
                id: `${campaignId.toString()}_rec1`,
                type: 'campaignTubeCollectiveResults',
              }, {
                id: `${campaignId.toString()}_rec2`,
                type: 'campaignTubeCollectiveResults',
              }]
            }
          },
        },
        included: [{
          id: '123_rec1',
          type: 'campaignTubeCollectiveResults',
          attributes: {
            'average-validated-skills': 2,
            'competence-name': 'Competence C',
            'tube-id': 'rec1',
            'tube-practical-title': 'Cat',
            'area-color': 'jaffa',
            'total-skills-count': 3,
          }
        }, {
          id: '123_rec2',
          type: 'campaignTubeCollectiveResults',
          attributes: {
            'average-validated-skills': 1,
            'competence-name': 'Competence C',
            'tube-id': 'rec2',
            'tube-practical-title': 'Dog',
            'area-color': 'cerulean',
            'total-skills-count': 4,
          }
        }]
      };

      // when
      const result = serializer.serialize(campaignCollectiveResult);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
