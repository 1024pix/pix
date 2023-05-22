import { domainBuilder, expect } from '../../../../test-helper.js';
import { CompetenceResult } from '../../../../../lib/domain/read-models/participant-results/CompetenceResult.js';
import { KnowledgeElement } from '../../../../../lib/domain/models/KnowledgeElement.js';

describe('Unit | Domain | Read-Models | ParticipantResult | CompetenceResult', function () {
  it('computes the result for the given competence', function () {
    const competence = domainBuilder.buildCompetence({
      id: 'rec1',
      name: 'C1',
      index: '1.1',
    });

    const area = domainBuilder.buildArea({
      name: 'DomaineNom1',
      title: 'DomaineTitre1',
      color: 'Couleur1',
    });

    const totalSkillsCount = 3;

    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.VALIDATED }),
      domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.INVALIDATED }),
    ];

    const flashPixScore = 123.456;

    const reachedStage = 1;

    const competenceResult = new CompetenceResult({
      competence,
      area,
      totalSkillsCount,
      knowledgeElements,
      flashPixScore,
      reachedStage,
    });

    expect(competenceResult).to.deep.equal({
      id: 'rec1',
      name: 'C1',
      index: '1.1',
      areaName: 'DomaineNom1',
      areaTitle: 'DomaineTitre1',
      areaColor: 'Couleur1',
      testedSkillsCount: 2,
      totalSkillsCount: 3,
      validatedSkillsCount: 1,
      masteryPercentage: 33,
      flashPixScore: 123.456,
      reachedStage: 1,
    });
  });
});
