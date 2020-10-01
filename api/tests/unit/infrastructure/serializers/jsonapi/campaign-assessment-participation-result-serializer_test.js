const { expect, domainBuilder } = require('../../../../test-helper');
const CampaignAssessmentParticipationResult = require('../../../../../lib/domain/read-models/CampaignAssessmentParticipationResult');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer');

describe('Unit | Serializer | JSONAPI | campaign-assessment-participation-result-serializer', function() {

  describe('#serialize()', function() {

    let modelCampaignAssessmentParticipationResult;
    let expectedJsonApi;

    beforeEach(() => {

      const targetedCompetence = domainBuilder.buildTargetedCompetence({ id: 'competence1', skills: ['oneSkill'], areaId: 'area1' });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'area1', competences: [targetedCompetence] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ competences: [targetedCompetence], areas: [targetedArea] });
      const knowledgeElement = domainBuilder.buildKnowledgeElement({ skillId: 'someSkillId', competenceId: targetedCompetence.id, status: 'validated' });
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
                id: targetedCompetence.id,
                type: 'campaign-assessment-participation-competence-results',
              }],
            },
          },
        },
        included: [{
          type: 'campaign-assessment-participation-competence-results',
          id: targetedCompetence.id,
          attributes: {
            name: targetedCompetence.name,
            'index': targetedCompetence.index,
            'targeted-skills-count': 1,
            'validated-skills-count': 1,
            'area-color': targetedArea.color,
          },
        }],
      };

      modelCampaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
        targetedCompetences: [targetedCompetence],
        campaignParticipationId: 1,
        campaignId: 2,
        targetProfile,
        validatedTargetedKnowledgeElementsByCompetenceId: { [targetedCompetence.id]: [knowledgeElement] },
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
