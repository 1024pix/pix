import { expect, domainBuilder } from '../../../../test-helper';
import BadgeResult from '../../../../../lib/domain/read-models/participant-results/BadgeResult';
import KnowledgeElement from '../../../../../lib/domain/models/KnowledgeElement';

describe('Unit | Domain | Read-Models | ParticipantResult | BadgeResult', function () {
  it('computes the badges results', function () {
    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: KnowledgeElement.StatusType.INVALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill3', status: KnowledgeElement.StatusType.VALIDATED }),
    ];

    const participationResults = { knowledgeElements, acquiredBadgeIds: [1] };

    const badge = {
      id: 1,
      title: 'Badge Yellow',
      message: 'Yellow Message',
      altMessage: 'Yellow Alt Message',
      key: 'YELLOW',
      imageUrl: 'yellow.svg',
      isCertifiable: false,
      isAlwaysVisible: false,
      isValid: true,
      badgeCompetences: [],
    };

    const badgeResult = new BadgeResult(badge, participationResults);

    expect(badgeResult).to.deep.equal({
      id: 1,
      title: 'Badge Yellow',
      message: 'Yellow Message',
      altMessage: 'Yellow Alt Message',
      isAcquired: true,
      key: 'YELLOW',
      imageUrl: 'yellow.svg',
      isCertifiable: false,
      isAlwaysVisible: false,
      isValid: true,
      skillSetResults: [],
    });
  });

  it('computes the result for each badge competence', function () {
    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: KnowledgeElement.StatusType.INVALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill4', status: KnowledgeElement.StatusType.VALIDATED }),
    ];

    const participationResults = { knowledgeElements, acquiredBadgeIds: [1] };

    const badgeCompetence1 = {
      id: 11,
      name: 'BadgeCompetence1',
      color: 'ColorBadgeCompetence1',
      skillIds: ['skill1', 'skill2', 'skill3'],
    };
    const badgeCompetence2 = {
      id: 12,
      name: 'BadgeCompetence2',
      color: 'ColorBadgeCompetence2',
      skillIds: ['skill4'],
    };

    const badge = {
      badgeCompetences: [badgeCompetence1, badgeCompetence2],
    };

    const badgeResult = new BadgeResult(badge, participationResults);
    const skillSetResult1 = badgeResult.skillSetResults.find(({ id }) => id === 11);
    const skillSetResult2 = badgeResult.skillSetResults.find(({ id }) => id === 12);
    expect(skillSetResult1).to.deep.include({ masteryPercentage: 33, name: 'BadgeCompetence1' });
    expect(skillSetResult2).to.deep.include({ masteryPercentage: 100, name: 'BadgeCompetence2' });
  });
});
