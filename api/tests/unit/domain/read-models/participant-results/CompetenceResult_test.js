const { domainBuilder, expect } = require('../../../../test-helper');
const CompetenceResult = require('../../../../../lib/domain/read-models/participant-results/CompetenceResult');
const KnowledgeElement = require('../../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Domain | Read-Models | ParticipantResult | CompetenceResult', function () {
  it('computes the result for the given competence', function () {
    const competence = domainBuilder.buildCompetence({
      id: 'rec1',
      name: 'C1',
      index: '1.1',
    });

    const area = domainBuilder.buildArea({
      name: 'Domaine1',
      color: 'Couleur1',
    });

    const totalSkillsCount = 3;

    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.VALIDATED }),
      domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.INVALIDATED }),
    ];

    const competenceResult = new CompetenceResult({ competence, area, totalSkillsCount, knowledgeElements });

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
