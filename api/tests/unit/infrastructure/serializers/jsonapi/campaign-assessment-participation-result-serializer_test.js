const { expect, domainBuilder } = require('../../../../test-helper');
const CampaignAssessmentParticipationResult = require('../../../../../lib/domain/read-models/CampaignAssessmentParticipationResult');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer');

describe('Unit | Serializer | JSONAPI | campaign-assessment-participation-result-serializer', function() {

  describe('#serialize()', function() {

    let modelCampaignAssessmentParticipationResult;
    let expectedJsonApi;

    beforeEach(() => {
      const competence = domainBuilder.buildCompetence({ skillIds: ['recSkill0'] });
      const knowledgeElement = domainBuilder.buildKnowledgeElement({ skillId: 'recSkill0', competenceId: competence.id, status: 'validated' });
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
                id: competence.id,
                type: 'campaign-assessment-participation-competence-results',
              }],
            },
          },
        },
        included: [{
          type: 'campaign-assessment-participation-competence-results',
          id: competence.id,
          attributes: {
            name: competence.name,
            'index': competence.index,
            'targeted-skills-count': 1,
            'validated-skills-count': 1,
            'area-color': competence.area.color,
          },
        }],
      };

      modelCampaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
        competences: [competence],
        campaignParticipationId: 1,
        campaignId: 2,
        targetedSkillIds: ['recSkill0'],
        knowledgeElementsByCompetenceId: { [competence.id]: [knowledgeElement] },
        isShared: true,
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
