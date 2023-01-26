const _ = require('lodash');
const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-collective-result-serializer');

describe('Unit | Serializer | JSONAPI | campaign-collective-results-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const campaignId = 123;

      const skillsCompetence1 = _.times(3, domainBuilder.buildSkill());
      const targetedTube1 = domainBuilder.buildTube({ skills: skillsCompetence1 });
      const area1 = domainBuilder.buildArea({
        id: 'area1',
        color: 'jaffa',
        competences: [
          domainBuilder.buildCompetence({
            id: 'rec1',
            index: '1.2',
            name: 'Cuisson des legumes d’automne',
            tubes: [targetedTube1],
            areaId: 'area1',
          }),
        ],
      });

      const skillsCompetence2 = _.times(4, domainBuilder.buildSkill());
      const targetedTube2 = domainBuilder.buildTube({ skills: skillsCompetence2 });
      const area2 = domainBuilder.buildArea({
        id: 'area2',
        color: 'cerulean',
        competences: [
          domainBuilder.buildCompetence({
            id: 'rec2',
            index: '3.4',
            name: 'Tourner un champignon',
            tubes: [targetedTube2],
            areaId: 'area2',
          }),
        ],
      });

      const framework = domainBuilder.buildFramework({ areas: [area1, area2] });
      const campaignLearningContent = domainBuilder.buildCampaignLearningContent.fromFrameworks([framework]);

      const campaignCollectiveResult = domainBuilder.buildCampaignCollectiveResult({
        id: campaignId,
        campaignLearningContent,
        participantCount: 1,
        participantsValidatedKECountByCompetenceId: [
          {
            rec1: 2,
            rec2: 1,
          },
        ],
      });

      const expectedSerializedResult = {
        data: {
          id: campaignId.toString(),
          type: 'campaign-collective-results',
          attributes: {},
          relationships: {
            'campaign-competence-collective-results': {
              data: [
                {
                  id: `${campaignId.toString()}_rec1`,
                  type: 'campaignCompetenceCollectiveResults',
                },
                {
                  id: `${campaignId.toString()}_rec2`,
                  type: 'campaignCompetenceCollectiveResults',
                },
              ],
            },
          },
        },
        included: [
          {
            id: '123_rec1',
            type: 'campaignCompetenceCollectiveResults',
            attributes: {
              'average-validated-skills': 2,
              'competence-id': 'rec1',
              'competence-name': 'Cuisson des legumes d’automne',
              'area-code': '1',
              'area-color': 'jaffa',
              'targeted-skills-count': 3,
            },
          },
          {
            id: '123_rec2',
            type: 'campaignCompetenceCollectiveResults',
            attributes: {
              'average-validated-skills': 1,
              'competence-id': 'rec2',
              'competence-name': 'Tourner un champignon',
              'area-code': '3',
              'area-color': 'cerulean',
              'targeted-skills-count': 4,
            },
          },
        ],
      };

      // when
      const result = serializer.serialize(campaignCollectiveResult);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
