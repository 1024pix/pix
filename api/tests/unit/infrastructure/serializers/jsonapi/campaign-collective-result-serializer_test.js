const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-collective-result-serializer');

describe('Unit | Serializer | JSONAPI | campaign-collective-results-serializer', () => {

  describe('#serialize', () => {

    it('should return a serialized JSON data object', () => {
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
  });
});
