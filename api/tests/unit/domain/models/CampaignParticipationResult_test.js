const { expect } = require('../../../test-helper');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');
const Area = require('../../../../lib/domain/models/Area');
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

    const jaffaArea = new Area({ color: 'jaffa' });
    const wildStrawberryArea = new Area({ color: 'wild-strawberry' });

    const competences = [
      { id: 1, name: 'Economie symbiotique', index: '5.1', skills: [1], area: jaffaArea },
      { id: 2, name: 'Désobéissance civile', index: '6.9', skills: [2, 3, 4], area: wildStrawberryArea },
      { id: 3, name: 'Démocratie liquide', index: '8.6', skills: [5, 6], area: wildStrawberryArea },
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

      const badge = {
        id: 1,
        imageUrl: '/img/banana.svg',
        message: 'Congrats, you won the Banana badge!'
      };

      const result = CampaignParticipationResult.buildFrom({ campaignParticipationId, assessment, competences, targetProfile, knowledgeElements, badge });

      expect(result).to.be.an.instanceOf(CampaignParticipationResult);
      expect(result).to.deep.equal({
        id: campaignParticipationId,
        isCompleted: false,
        areBadgeCriteriaValidated: false,
        totalSkillsCount: 4,
        testedSkillsCount: 2,
        validatedSkillsCount: 1,
        masteryPercentage: 25,
        badge: {
          id: 1,
          imageUrl: '/img/banana.svg',
          message: 'Congrats, you won the Banana badge!',
        },
        competenceResults: [{
          id: 1,
          name: 'Economie symbiotique',
          index: '5.1',
          areaColor: 'jaffa',
          totalSkillsCount: 1,
          testedSkillsCount: 1,
          validatedSkillsCount: 1,
        }, {
          id: 2,
          name: 'Désobéissance civile',
          index: '6.9',
          areaColor: 'wild-strawberry',
          totalSkillsCount: 3,
          testedSkillsCount: 1,
          validatedSkillsCount: 0,
        }],
      });
    });
  });
});
