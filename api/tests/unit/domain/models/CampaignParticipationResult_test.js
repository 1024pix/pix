const { expect } = require('../../../test-helper');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Domain | Models | CampaignParticipationResult', () => {

  describe('#buildFrom', () => {

    const campaignParticipationId = 'campaignParticipationId';
    const userId = 'userId';
    const assessmentId = 'assessmentId';

    const skills = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const knowledgeElements = [
      new KnowledgeElement({ skillId: 1, status: 'validated' }),
      new KnowledgeElement({ skillId: 2, status: 'invalidated' }),
      new KnowledgeElement({ skillId: 7, status: 'validated' }),
    ];

    const competences = [
      { id: 1, name: 'Economie symbiotique', index: '5.1', skills: [1] },
      { id: 2, name: 'Désobéissance civile', index: '6.9', skills: [2, 3, 4] },
      { id: 3, name: 'Démocratie liquide', index: '8.6', skills: [5, 6] },
    ];

    const targetProfile = {
      skills,
    };

    const assessment = {
      id: assessmentId,
      userId,
      isCompleted() {
        return false;
      },
    };

    it('should add the campaign participation results', () => {

      const result = CampaignParticipationResult.buildFrom({ campaignParticipationId, assessment, competences, targetProfile, knowledgeElements, couldBeImprove:true });

      expect(result).to.be.an.instanceOf(CampaignParticipationResult);
      expect(result).to.deep.equal({
        id: campaignParticipationId,
        isCompleted: false,
        totalSkillsCount: 4,
        testedSkillsCount: 2,
        validatedSkillsCount: 1,
        couldBeImprove: true,
        competenceResults: [{
          id: 1,
          name: 'Economie symbiotique',
          index: '5.1',
          totalSkillsCount: 1,
          testedSkillsCount: 1,
          validatedSkillsCount: 1,
        }, {
          id: 2,
          name: 'Désobéissance civile',
          index: '6.9',
          totalSkillsCount: 3,
          testedSkillsCount: 1,
          validatedSkillsCount: 0,
        }],
      });
    });
  });
});
