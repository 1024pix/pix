const _ = require('lodash');
const { expect, sinon } = require('../../../test-helper');
const handleBadgeAcquisition = require('../../../../lib/domain/usecases/handle-badge-acquisition');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Usecase | handle-badge-acquisition', function () {
  describe('#handleBadgeAcquisition', function () {
    let badgeRepository, targetProfileRepository, knowledgeElementRepository, badgeAcquisitionRepository;
    let badgeCriteriaService;
    let dependencies;

    beforeEach(function () {
      badgeRepository = {
        findByCampaignParticipationId: _.noop,
      };
      targetProfileRepository = {
        getByCampaignParticipationId: _.noop,
      };
      knowledgeElementRepository = {
        findUniqByUserId: _.noop,
      };
      badgeAcquisitionRepository = {
        createOrUpdate: _.noop,
      };
      badgeCriteriaService = {
        areBadgeCriteriaFulfilled: _.noop,
      };

      dependencies = {
        badgeAcquisitionRepository,
        badgeCriteriaService,
        badgeRepository,
        knowledgeElementRepository,
        targetProfileRepository,
      };
    });

    context('when the assessment belongs to a campaign', function () {
      let assessment;

      beforeEach(function () {
        assessment = new Assessment({
          userId: 'userId',
          campaignParticipationId: 'campaignParticipationId',
          type: Assessment.types.CAMPAIGN,
        });
      });

      context('when the campaign is associated to one badge', function () {
        let badge;
        let targetProfile;
        let knowledgeElements;
        let badgeId;

        beforeEach(function () {
          badgeId = Symbol('badgeId');
          targetProfile = Symbol('targetProfile');
          knowledgeElements = Symbol('knowledgeElements');

          sinon.stub(badgeRepository, 'findByCampaignParticipationId');
          badge = {
            id: badgeId,
            badgeCriteria: Symbol('badgeCriteria'),
          };
          badgeRepository.findByCampaignParticipationId.withArgs(assessment.campaignParticipationId).resolves([badge]);

          sinon.stub(targetProfileRepository, 'getByCampaignParticipationId');
          targetProfileRepository.getByCampaignParticipationId
            .withArgs(assessment.campaignParticipationId)
            .resolves(targetProfile);

          sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId: assessment.userId })
            .resolves(knowledgeElements);
          sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
          sinon.stub(badgeAcquisitionRepository, 'createOrUpdate');
        });

        it('should create a badge when badge requirements are fulfilled', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge })
            .returns(true);

          // when
          await handleBadgeAcquisition({ assessment, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly([
            {
              badgeId,
              userId: assessment.userId,
              campaignParticipationId: assessment.campaignParticipationId,
            },
          ]);
        });

        it('should not create a badge when badge requirements are not fulfilled', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge })
            .returns(false);

          // when
          await handleBadgeAcquisition({ assessment, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
        });
      });

      context('when the campaign is associated to two badges', function () {
        let badge1, badge2;
        let badgeId_1, badgeId_2;
        let targetProfile;
        let knowledgeElements;

        beforeEach(function () {
          badgeId_1 = Symbol('badgeId_1');
          badgeId_2 = Symbol('badgeId_2');
          targetProfile = Symbol('targetProfile');
          knowledgeElements = Symbol('knowledgeElements');

          sinon.stub(badgeRepository, 'findByCampaignParticipationId');
          badge1 = {
            id: badgeId_1,
            badgeCriteria: Symbol('badgeCriteria'),
          };
          badge2 = {
            id: badgeId_2,
            badgeCriteria: Symbol('badgeCriteria'),
          };
          badgeRepository.findByCampaignParticipationId
            .withArgs(assessment.campaignParticipationId)
            .resolves([badge1, badge2]);

          sinon.stub(targetProfileRepository, 'getByCampaignParticipationId');
          targetProfileRepository.getByCampaignParticipationId
            .withArgs(assessment.campaignParticipationId)
            .resolves(targetProfile);

          sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId: assessment.userId })
            .resolves(knowledgeElements);

          sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
          sinon.stub(badgeAcquisitionRepository, 'createOrUpdate');
        });

        it('should create one badge when only one badge requirements are fulfilled', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge: badge2 })
            .returns(false);

          // when
          await handleBadgeAcquisition({ assessment, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly([
            {
              badgeId: badge1.id,
              userId: assessment.userId,
              campaignParticipationId: assessment.campaignParticipationId,
            },
          ]);
        });

        it('should create two badges when both badges requirements are fulfilled', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge: badge2 })
            .returns(true);

          // when
          await handleBadgeAcquisition({ assessment, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly([
            {
              badgeId: badge1.id,
              userId: assessment.userId,
              campaignParticipationId: assessment.campaignParticipationId,
            },
            {
              badgeId: badge2.id,
              userId: assessment.userId,
              campaignParticipationId: assessment.campaignParticipationId,
            },
          ]);
        });
      });

      context('when the campaign is not associated to a badge', function () {
        it('should not create a badge', async function () {
          // given
          const userId = 42;
          const campaignParticipationId = 78;
          const assessment = new Assessment({ userId, campaignParticipationId });
          sinon.stub(badgeRepository, 'findByCampaignParticipationId');
          badgeRepository.findByCampaignParticipationId.withArgs(assessment.campaignParticipationId).resolves([]);

          sinon.stub(badgeAcquisitionRepository, 'createOrUpdate');

          // when
          await handleBadgeAcquisition({ assessment, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
        });
      });
    });

    context('when the assessment does not belong to a campaign', function () {
      it('should not create a badge', async function () {
        // given
        sinon.stub(badgeAcquisitionRepository, 'createOrUpdate');

        const userId = 42;
        const assessment = new Assessment({ userId });

        // when
        await handleBadgeAcquisition({ assessment, ...dependencies });

        // then
        expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
      });
    });
  });
});
