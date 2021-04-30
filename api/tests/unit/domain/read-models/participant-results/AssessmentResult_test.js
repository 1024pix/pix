const { domainBuilder, expect, sinon } = require('../../../../test-helper');
const AssessmentResult = require('../../../../../lib/domain/read-models/participant-results/AssessmentResult');
const KnowledgeElement = require('../../../../../lib/domain/models/KnowledgeElement');
const constants = require('../../../../../lib/domain/constants');

describe('Unit | Domain | Read-Models | ParticipantResult | AssessmentResult', () => {

  it('computes the number of skills, the number of skill tested and the number of skill validated', () => {
    const competences = [
      { id: 'rec1', name: 'C1', index: '1.1', areaName: 'Domaine1', areaColor: 'Couleur1', skillIds: ['skill1', 'skill2'] },
      { id: 'rec2', name: 'C2', index: '2.1', areaName: 'Domaine2', areaColor: 'Couleur2', skillIds: ['skill3', 'skill4'] },
    ];

    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: KnowledgeElement.StatusType.INVALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill4', status: KnowledgeElement.StatusType.VALIDATED }),
    ];
    const participationResults = { campaignParticipationId: 12, isCompleted: true, knowledgeElements, acquiredBadgeIds: [] };

    const targetProfile = { competences, stages: [], badges: [] };

    const assessmentResult = new AssessmentResult(participationResults, targetProfile);

    expect(assessmentResult).to.deep.include({
      id: 12,
      totalSkillsCount: 4,
      testedSkillsCount: 3,
      validatedSkillsCount: 2,
      isCompleted: true,
    });
  });

  describe('masteryPercentage computation', () => {
    it('computes the mastery percentage', () => {
      const competences = [
        { id: 'rec1', name: 'C1', index: '1.1', areaName: 'Domaine1', areaColor: 'Couleur1', skillIds: ['skill1', 'skill2', 'skill2'] },
        { id: 'rec2', name: 'C2', index: '2.1', areaName: 'Domaine2', areaColor: 'Couleur2', skillIds: ['skill5', 'skill5', 'skill6'] },
      ];

      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
        domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: KnowledgeElement.StatusType.INVALIDATED }),
        domainBuilder.buildKnowledgeElement({ skillId: 'skill3', status: KnowledgeElement.StatusType.VALIDATED }),
        domainBuilder.buildKnowledgeElement({ skillId: 'skill4', status: KnowledgeElement.StatusType.VALIDATED }),
        domainBuilder.buildKnowledgeElement({ skillId: 'skill5', status: KnowledgeElement.StatusType.VALIDATED }),
      ];
      const participationResults = { campaignParticipationId: 12, isCompleted: true, knowledgeElements, acquiredBadgeIds: [] };

      const targetProfile = { competences, stages: [], badges: [] };

      const assessmentResult = new AssessmentResult(participationResults, targetProfile);

      expect(assessmentResult.masteryPercentage).to.equal(67);
    });
  });

  it('computes the result by competences', () => {

    const competences = [
      { id: 'rec1', name: 'C1', index: '1.1', areaName: 'Domaine1', areaColor: 'Couleur1', skillIds: ['skill1', 'skill2', 'skill3'] },
      { id: 'rec2', name: 'C2', index: '2.1', areaName: 'Domaine2', areaColor: 'Couleur2', skillIds: ['skill4'] },
    ];

    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: KnowledgeElement.StatusType.INVALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill4', status: KnowledgeElement.StatusType.VALIDATED }),
    ];

    const participationResults = { knowledgeElements, acquiredBadgeIds: [] };

    const targetProfile = { competences, stages: [], badges: [] };

    const assessmentResult = new AssessmentResult(participationResults, targetProfile);

    const competenceResults1 = assessmentResult.competenceResults.find(({ id }) => competences[0].id === id);
    const competenceResults2 = assessmentResult.competenceResults.find(({ id }) => competences[1].id === id);

    expect(competenceResults1).to.deep.include({ name: 'C1', masteryPercentage: 33 });
    expect(competenceResults2).to.deep.include({ name: 'C2', masteryPercentage: 100 });
  });

  describe('when the targetProfile has stages', () => {
    it('gives the reached stage', () => {

      const competences = [{ id: 'rec1', name: 'C1', index: '1.1', areaName: 'Domaine1', areaColor: 'Couleur1', skillIds: ['skill1', 'skill2', 'skill3'] }];

      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
        domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: KnowledgeElement.StatusType.INVALIDATED }),
        domainBuilder.buildKnowledgeElement({ skillId: 'skill3', status: KnowledgeElement.StatusType.VALIDATED }),
      ];
      const participationResults = { knowledgeElements, acquiredBadgeIds: [] };

      const stages = [
        { id: 1, title: 'Stage1', message: 'message1', threshold: 25 },
        { id: 2, title: 'Stage2', message: 'message2', threshold: 60 },
        { id: 3, title: 'Stage3', message: 'message3', threshold: 90 },
      ];

      const targetProfile = { competences, stages, badges: [] };

      const assessmentResult = new AssessmentResult(participationResults, targetProfile);

      expect(assessmentResult.reachedStage).to.deep.include({ id: 2, title: 'Stage2', starCount: 2 });
      expect(assessmentResult.stageCount).to.equal(3);
    });
  });

  describe('when the targetProfile has badges', () => {
    it('computes results for each badge', () => {

      const competences = [{ id: 'rec1', name: 'C1', index: '1.1', areaName: 'Domaine1', areaColor: 'Couleur1', skillIds: ['skill1', 'skill2', 'skill3'] }];
      const participationResults = { knowledgeElements: [], acquiredBadgeIds: [1] };

      const badges = [
        {
          id: 2,
          title: 'Badge Blue',
          message: 'Badge Blue Message',
          altMessage: 'Badge Blue Alt Message',
          key: 'Blue',
          imageUrl: 'blue.svg',
          badgeCompetences: [],
        },
        {
          id: 1,
          title: 'Badge Yellow',
          message: 'Yellow Message',
          altMessage: 'Yellow Alt Message',
          key: 'YELLOW',
          imageUrl: 'yellow.svg',
          badgeCompetences: [],
        },
      ];

      const targetProfile = { competences, stages: [], badges };

      const assessmentResult = new AssessmentResult(participationResults, targetProfile);
      const badgeResult1 = assessmentResult.badgeResults.find(({ id }) => id === 1);
      const badgeResult2 = assessmentResult.badgeResults.find(({ id }) => id === 2);
      expect(badgeResult1).to.deep.include({ title: 'Badge Yellow', isAcquired: true });
      expect(badgeResult2).to.deep.include({ title: 'Badge Blue', isAcquired: false });
    });
  });

  describe('#canRetry', () => {
    const now = new Date('2020-01-05T05:06:07Z');
    let clock;
    constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING = 3;

    beforeEach(() => {
      clock = sinon.useFakeTimers(now);
    });

    afterEach(() => {
      clock.restore();
    });

    context('when the campaign does not allow multiple sendings', () => {
      it('returns false', () => {
        const isCampaignMultipleSendings = false;
        const participationResults = {
          knowledgeElements: [],
          acquiredBadgeIds: [],
          sharedAt: new Date('2020-01-04'),
        };
        const targetProfile = { competences: [], stages: [], badges: [] };

        const assessmentResult = new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings);

        expect(assessmentResult.canRetry).to.be.false;
      });
    });

    context('when the participation has been shared less than MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING days ago', () => {
      it('returns false', () => {
        const isCampaignMultipleSendings = true;
        const participationResults = {
          knowledgeElements: [],
          acquiredBadgeIds: [],
          sharedAt: new Date('2020-01-03'),
        };
        const targetProfile = { competences: [], stages: [], badges: [] };

        const assessmentResult = new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings);

        expect(assessmentResult.canRetry).to.be.false;
      });
    });

    context('when the mastery percentage is 100%', () => {
      it('returns false', () => {
        const isCampaignMultipleSendings = true;
        const competences = [{ id: 'rec1', name: 'C1', index: '1.1', areaName: 'Domaine1', areaColor: 'Couleur1', skillIds: ['skill1'] }];
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
        ];
        const participationResults = {
          knowledgeElements,
          acquiredBadgeIds: [],
          sharedAt: new Date('2020-01-01'),
        };
        const targetProfile = { competences, stages: [], badges: [] };

        const assessmentResult = new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings);

        expect(assessmentResult.canRetry).to.be.false;
      });
    });

    context('when the campaign allow multiple sendings, the mastery percentage is under 100% and the participation has been shared more than MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING days ago', () => {
      it('returns true', () => {
        const isCampaignMultipleSendings = true;
        const competences = [{ id: 'rec1', name: 'C1', index: '1.1', areaName: 'Domaine1', areaColor: 'Couleur1', skillIds: ['skill1', 'skill2', 'skill3'] }];
        const participationResults = {
          knowledgeElements: [],
          acquiredBadgeIds: [],
          sharedAt: new Date('2020-01-01'),
        };
        const targetProfile = { competences, stages: [], badges: [] };
        const assessmentResult = new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings);

        expect(assessmentResult.canRetry).to.be.true;
      });
    });
  });
});
