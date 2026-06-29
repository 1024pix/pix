import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { CompetenceResult } from '../../../../../../src/shared/domain/read-models/participant-results/CompetenceResult.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Read-Models | ParticipantResult | CompetenceResult', function () {
  it('computes the result for the given competence', function () {
    const competence = domainBuilder.buildCompetence({
      id: 'rec1',
      name: 'C1',
      index: '1.1',
      description: 'Une description',
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

    const reachedStage = 1;

    const competenceResult = new CompetenceResult({
      competence,
      area,
      totalSkillsCount,
      knowledgeElements,
      reachedStage,
    });

    expect(competenceResult).to.deep.equal({
      id: 'rec1',
      name: 'C1',
      index: '1.1',
      description: 'Une description',
      areaName: 'DomaineNom1',
      areaTitle: 'DomaineTitre1',
      areaColor: 'Couleur1',
      testedSkillsCount: 2,
      totalSkillsCount: 3,
      validatedSkillsCount: 1,
      masteryPercentage: 33,
      reachedStage: 1,
    });
  });
});
