const { expect } = require('../../../../test-helper');
const CampaignAssessmentParticipationResult = require('../../../../../lib/domain/read-models/CampaignAssessmentParticipationResult');
const CampaignAssessmentParticipationCompetenceResult = require('../../../../../lib/domain/read-models/CampaignAssessmentParticipationCompetenceResult');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer');

describe('Unit | Serializer | JSONAPI | campaign-assessment-participation-result-serializer', function() {

  describe('#serialize()', function() {

    let modelCampaignAssessmentParticipationResult;
    let expectedJsonApi;

    beforeEach(() => {
      expectedJsonApi = {
        data: {
          type: 'campaign-assessment-participation-results',
          id: '1',
          attributes: {
            'campaign-id': 2,
          },
          relationships: {
            'competence-results': {
              data: [{
                id: '3',
                type: 'campaign-assessment-participation-competence-results',
              }]
            },
          },
        },
        included: [{
          type: 'campaign-assessment-participation-competence-results',
          id: '3',
          attributes: {
            name: 'Raper des carottes',
            'index': '1.1',
            'total-skills-count': 12,
            'validated-skills-count': 5,
            'area-color': 'blue',
          },
        }],
      };

      modelCampaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
        campaignParticipationId: 1,
        campaignId: 2,
        competenceResults: [ new CampaignAssessmentParticipationCompetenceResult({
          id: 3,
          name: 'Raper des carottes',
          index: '1.1',
          totalSkillsCount: 12,
          validatedSkillsCount: 5,
          area: {
            id: 1,
            title: 'area1',
            color: 'blue',
          },
        })]
      });
    });

    it('should convert a CampaignAssessmentParticipation model object into JSON API data', function() {
      // when
      const json = serializer.serialize(modelCampaignAssessmentParticipationResult);

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
