const { domainBuilder, expect } = require('../../../../test-helper');
const PartnerCompetenceResults = require('../../../../../lib/domain/read-models/participant-results/PartnerCompetenceResult');
const KnowledgeElement = require('../../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Domain | Read-Models | ParticipantResults | PartnerCompetenceResult', () => {

  it('computes the result for the given competence', () => {

    const badgeCompetence = {
      id: 'rec1',
      name: 'C1',
      color: 'Couleur1',
      skillIds: ['skill1', 'skill2', 'skill3'],
    };

    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.VALIDATED }),
      domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.INVALIDATED }),
    ];

    const partnerCompetenceResult = new PartnerCompetenceResults(badgeCompetence, knowledgeElements);

    expect(partnerCompetenceResult).to.deep.equal({
      id: 'rec1',
      name: 'C1',
      color: 'Couleur1',
      testedSkillsCount: 2,
      totalSkillsCount: 3,
      validatedSkillsCount: 1,
      masteryPercentage: 33,
    });
  });
});
