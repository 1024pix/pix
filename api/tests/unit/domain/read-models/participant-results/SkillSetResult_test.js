import { domainBuilder, expect } from '../../../../test-helper';
import SkillSetResult from '../../../../../lib/domain/read-models/participant-results/SkillSetResult';
import KnowledgeElement from '../../../../../lib/domain/models/KnowledgeElement';

describe('Unit | Domain | Read-Models | ParticipantResults | SkillSetResult', function () {
  it('computes the result for the given competence', function () {
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

    const skillSetResults = new SkillSetResult(badgeCompetence, knowledgeElements);

    expect(skillSetResults).to.deep.equal({
      id: 'rec1',
      name: 'C1',
      testedSkillsCount: 2,
      totalSkillsCount: 3,
      validatedSkillsCount: 1,
      masteryPercentage: 33,
    });
  });
});
