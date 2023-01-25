const { domainBuilder, expect } = require('../../../../test-helper');
const CompetenceResult = require('../../../../../lib/domain/read-models/participant-results/CompetenceResult');
const KnowledgeElement = require('../../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Domain | Read-Models | ParticipantResult | CompetenceResult', function () {
  it('computes the result for the given competence', function () {
    const competence = {
      id: 'rec1',
      name: 'C1',
      index: '1.1',
      areaName: 'Domaine1',
      areaColor: 'Couleur1',
      skillIds: ['skill1', 'skill2', 'skill3'],
    };

    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.VALIDATED }),
      domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.INVALIDATED }),
    ];

    const competenceResult = new CompetenceResult({ competence, knowledgeElements });

    expect(competenceResult).to.deep.equal({
      id: 'rec1',
      name: 'C1',
      index: '1.1',
      areaName: 'Domaine1',
      areaColor: 'Couleur1',
      testedSkillsCount: 2,
      totalSkillsCount: 3,
      validatedSkillsCount: 1,
      masteryPercentage: 33,
    });
  });
});
