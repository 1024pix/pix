const { domainBuilder, expect, sinon } = require('../../../../test-helper');
const constants = require('../../../../../lib/domain/constants');
const AssessmentResult = require('../../../../../lib/domain/read-models/participant-results/AssessmentResult');
const KnowledgeElement = require('../../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Domain | Read-Models | ParticipantResult | AssessmentResult', function() {

  it('computes the number of skills, the number of skill tested and the number of skill validated', function() {
    const competences = [
      { id: 'rec1', name: 'C1', index: '1.1', areaName: 'Domaine1', areaColor: 'Couleur1', skillIds: ['skill1', 'skill2'] },
      { id: 'rec2', name: 'C2', index: '2.1', areaName: 'Domaine2', areaColor: 'Couleur2', skillIds: ['skill3', 'skill4'] },
    ];

    const knowledgeElements = [
      domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: KnowledgeElement.StatusType.VALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill2', status: KnowledgeElement.StatusType.INVALIDATED }),
      domainBuilder.buildKnowledgeElement({ skillId: 'skill4', status: KnowledgeElement.StatusType.VALIDATED }),
    ];
    const participationResults = { campaignParticipationId: 12, isCompleted: true, knowledgeElements, acquiredBadgeIds: [], sharedAt: new Date(), participantExternalId: 'greg@lafleche.fr' };

    const targetProfile = { competences, stages: [], badges: [] };

    const assessmentResult = new AssessmentResult(participationResults, targetProfile, false, false);

    expect(assessmentResult).to.deep.include({
      id: 12,
      totalSkillsCount: 4,
      testedSkillsCount: 3,
      validatedSkillsCount: 2,
      isCompleted: true,
      isShared: true,
      participantExternalId: 'greg@lafleche.fr',
    });
  });

  describe('masteryPercentage computation', function() {
    it('computes the mastery percentage', function() {
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

      const assessmentResult = new AssessmentResult(participationResults, targetProfile, false, false);

      expect(assessmentResult.masteryPercentage).to.equal(67);
    });
  });

  it('computes the result by competences', function() {

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

    const assessmentResult = new AssessmentResult(participationResults, targetProfile, false, false);

    const competenceResults1 = assessmentResult.competenceResults.find(({ id }) => competences[0].id === id);
    const competenceResults2 = assessmentResult.competenceResults.find(({ id }) => competences[1].id === id);

    expect(competenceResults1).to.deep.include({ name: 'C1', masteryPercentage: 33 });
    expect(competenceResults2).to.deep.include({ name: 'C2', masteryPercentage: 100 });
  });

  describe('when the targetProfile has stages', function() {
    it('gives the reached stage', function() {

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

      const assessmentResult = new AssessmentResult(participationResults, targetProfile, false, false);

      expect(assessmentResult.reachedStage).to.deep.include({ id: 2, title: 'Stage2', starCount: 2 });
      expect(assessmentResult.stageCount).to.equal(3);
    });
  });

  describe('when the targetProfile has badges', function() {
    it('computes results for each badge', function() {

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

      const assessmentResult = new AssessmentResult(participationResults, targetProfile, false, false);
      const badgeResult1 = assessmentResult.badgeResults.find(({ id }) => id === 1);
      const badgeResult2 = assessmentResult.badgeResults.find(({ id }) => id === 2);
      expect(badgeResult1).to.deep.include({ title: 'Badge Yellow', isAcquired: true });
      expect(badgeResult2).to.deep.include({ title: 'Badge Blue', isAcquired: false });
    });
  });

  describe('#canRetry', function() {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const originalConstantValue = constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
    const now = new Date('2020-01-05T05:06:07Z');
    let clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers(now);
      constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING = 4;
    });

    afterEach(function() {
      clock.restore();
      constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING = originalConstantValue;
    });

    context('when the campaign does not allow multiple sendings', function() {
      it('returns false', function() {
        const participationResults = {
          knowledgeElements: [],
          acquiredBadgeIds: [],
          sharedAt: new Date('2020-01-04'),
        };
        const targetProfile = { competences: [], stages: [], badges: [] };

        const assessmentResult = new AssessmentResult(participationResults, targetProfile, false, false);

        expect(assessmentResult.canRetry).to.be.false;
      });
    });

    context('when participant is disabled', function() {
      it('returns false', function() {
        const isCampaignMultipleSendings = true;
        const participationResults = {
          knowledgeElements: [],
          acquiredBadgeIds: [],
          sharedAt: new Date('2020-01-04'),
        };
        const targetProfile = { competences: [], stages: [], badges: [] };

        const assessmentResult = new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings, false);

        expect(assessmentResult.canRetry).to.be.false;
      });
    });

    context('when the participation is not shared', function() {
      it('returns false', function() {
        const isCampaignMultipleSendings = true;
        const isRegistrationActive = true;
        const participationResults = {
          knowledgeElements: [],
          acquiredBadgeIds: [],
          sharedAt: null,
        };
        const targetProfile = { competences: [], stages: [], badges: [] };

        const assessmentResult = new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings, isRegistrationActive);

        expect(assessmentResult.canRetry).to.be.false;
      });
    });

    context('when the participation has been shared less than MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING days ago', function() {
      it('returns false', function() {
        const isCampaignMultipleSendings = true;
        const participationResults = {
          knowledgeElements: [],
          acquiredBadgeIds: [],
          sharedAt: new Date('2020-01-03'),
        };
        const targetProfile = { competences: [], stages: [], badges: [] };

        const assessmentResult = new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings, false);

        expect(assessmentResult.canRetry).to.be.false;
      });
    });

    context('when the mastery percentage is 100%', function() {
      it('returns false', function() {
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

        const assessmentResult = new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings, false);

        expect(assessmentResult.canRetry).to.be.false;
      });
    });

    context('when the campaign allow multiple sendings, the mastery percentage is under 100%, the participant is active and the participation has been shared more than MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING days ago', function() {
      it('returns true', function() {
        const isCampaignMultipleSendings = true;
        const isRegistrationActive = true;
        const competences = [{ id: 'rec1', name: 'C1', index: '1.1', areaName: 'Domaine1', areaColor: 'Couleur1', skillIds: ['skill1', 'skill2', 'skill3'] }];
        const participationResults = {
          knowledgeElements: [],
          acquiredBadgeIds: [],
          sharedAt: new Date('2020-01-01'),
        };
        const targetProfile = { competences, stages: [], badges: [] };
        const assessmentResult = new AssessmentResult(participationResults, targetProfile, isCampaignMultipleSendings, isRegistrationActive);

        expect(assessmentResult.canRetry).to.be.true;
      });
    });
  });

  describe('#canImprove', function() {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const originalConstantValue = constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING;
    const assessmentCreatedAt = new Date('2020-01-05T05:06:07Z');
    let clock;

    before(function() {
      constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING = 4;
    });

    after(function() {
      constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING = originalConstantValue;
    });

    beforeEach(function() {
      clock = sinon.useFakeTimers(assessmentCreatedAt);
    });

    afterEach(function() {
      clock.restore();
    });

    context('when the knowledge element has been created less than MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING days before assessment was created', function() {
      it('returns false', function() {
        const ke = domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.INVALIDATED, createdAt: new Date('2020-01-03') });
        const participationResults = {
          knowledgeElements: [ke],
          acquiredBadgeIds: [],
          assessmentCreatedAt,
        };
        const targetProfile = { competences: [], stages: [], badges: [] };

        const assessmentResult = new AssessmentResult(participationResults, targetProfile, false, false);

        expect(assessmentResult.canImprove).to.be.false;
      });
    });

    context('when the knowledge element is validated', function() {
      it('returns false', function() {
        const ke = domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.VALIDATED, createdAt: new Date('2020-01-01') });
        const participationResults = {
          knowledgeElements: [ke],
          acquiredBadgeIds: [],
          assessmentCreatedAt,
        };
        const targetProfile = { competences: [], stages: [], badges: [] };

        const assessmentResult = new AssessmentResult(participationResults, targetProfile, false, false);

        expect(assessmentResult.canImprove).to.be.false;
      });
    });

    context('when participation is shared', function() {
      it('returns false', function() {
        const ke = domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.INVALIDATED, createdAt: new Date('2020-01-01') });
        const participationResults = {
          knowledgeElements: [ke],
          acquiredBadgeIds: [],
          assessmentCreatedAt,
          sharedAt: new Date(),
        };
        const targetProfile = { competences: [], stages: [], badges: [] };
        const assessmentResult = new AssessmentResult(participationResults, targetProfile, false, false);

        expect(assessmentResult.canImprove).to.be.false;
      });
    });

    context('when participation is not shared and the knowledge element is invalidated and created more than MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING days before assessment was created', function() {
      it('returns true', function() {
        const ke = domainBuilder.buildKnowledgeElement({ status: KnowledgeElement.StatusType.INVALIDATED, createdAt: new Date('2020-01-01') });
        const participationResults = {
          knowledgeElements: [ke],
          acquiredBadgeIds: [],
          assessmentCreatedAt,
          sharedAt: null,
        };
        const targetProfile = { competences: [], stages: [], badges: [] };
        const assessmentResult = new AssessmentResult(participationResults, targetProfile, false, false);

        expect(assessmentResult.canImprove).to.be.true;
      });
    });
  });
});
