const { domainBuilder, expect } = require('../../../test-helper');
const BadgeResults = require('../../../../lib/domain/models/BadgeResults');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Domain | Models | BadgeResults', () => {
  context('masteryPercentage', () => {
    it('computes the global mastery percentage', async () => {
      const skills = ['skill1', 'skill2', 'skill3'];
      const knowledgeElements = [domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED })];
      const badgeResults = new BadgeResults([], skills, knowledgeElements);

      expect(badgeResults.masteryPercentage).to.deep.equal(33);
    });

  });
  context('when there are partner competences', () => {
    it('computes the mastery percentage for every partner competences', async () => {
      const skills = ['skill1', 'skill2', 'skill3', 'skill4'];
      const competence1 = { id: 'C1', skillIds: ['skill1', 'skill2'] };
      const competence2 = { id: 'C2', skillIds: ['skill3'] };
      const competence3 = { id: 'C3', skillIds: ['skill4'] };
      const badge1 = {
        id: 1,
        badgePartnerCompetences: [competence1, competence2],
      };
      const badge2 = {
        id: 2,
        badgePartnerCompetences: [competence3],
      };
      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
        domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: KnowledgeElement.StatusType.INVALIDATED }),
        domainBuilder.buildKnowledgeElement({ skillId: 'skill3', status: KnowledgeElement.StatusType.VALIDATED }),
        domainBuilder.buildKnowledgeElement({ skillId: 'skill4', status: KnowledgeElement.StatusType.INVALIDATED }),
      ];
      const badgeResults = new BadgeResults([badge1, badge2], skills, knowledgeElements);

      expect(badgeResults.campaignParticipationBadges).to.deep.equal([
        { id: 1, partnerCompetenceResults: [{ id: 'C1', masteryPercentage: 50 }, { id: 'C2', masteryPercentage: 100 }] },
        { id: 2, partnerCompetenceResults: [{ id: 'C3', masteryPercentage: 0 }] },
      ]);
    });
  });
});
