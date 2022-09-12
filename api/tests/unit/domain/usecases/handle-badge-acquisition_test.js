const { expect, sinon } = require('../../../test-helper');
const handleBadgeAcquisition = require('../../../../lib/domain/usecases/handle-badge-acquisition');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Unit | Usecase | handle-badge-acquisition', function () {
  describe('#handleBadgeAcquisition', function () {
    let badgeRepository, campaignRepository, knowledgeElementRepository, badgeAcquisitionRepository;
    let badgeCriteriaService;
    let domainTransaction;
    let dependencies;

    beforeEach(function () {
      badgeRepository = {
        findByCampaignParticipationId: sinon.stub(),
      };
      campaignRepository = {
        findSkillIdsByCampaignParticipationId: sinon.stub(),
      };
      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
      };
      badgeAcquisitionRepository = {
        createOrUpdate: sinon.stub(),
      };
      badgeCriteriaService = {
        areBadgeCriteriaFulfilled: sinon.stub(),
      };
      domainTransaction = Symbol('domainTransaction');

      dependencies = {
        badgeAcquisitionRepository,
        badgeCriteriaService,
        badgeRepository,
        knowledgeElementRepository,
        campaignRepository,
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
        let skillIds;
        let knowledgeElements;
        let badgeId;

        beforeEach(function () {
          badgeId = Symbol('badgeId');
          skillIds = Symbol('skillIds');
          knowledgeElements = Symbol('knowledgeElements');

          badge = new Badge({
            id: badgeId,
            badgeCriteria: Symbol('badgeCriteria'),
          });
          badgeRepository.findByCampaignParticipationId
            .withArgs({ campaignParticipationId: assessment.campaignParticipationId, domainTransaction })
            .resolves([badge]);

          campaignRepository.findSkillIdsByCampaignParticipationId
            .withArgs({ campaignParticipationId: assessment.campaignParticipationId, domainTransaction })
            .resolves(skillIds);

          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId: assessment.userId, domainTransaction })
            .resolves(knowledgeElements);
        });

        it('should create a badge when badge requirements are fulfilled', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ skillIds, knowledgeElements, badge }).returns(true);

          // when
          await handleBadgeAcquisition({ assessment, ...dependencies, domainTransaction });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly({
            badgeAcquisitionsToCreate: [
              {
                badgeId,
                userId: assessment.userId,
                campaignParticipationId: assessment.campaignParticipationId,
              },
            ],
            domainTransaction,
          });
        });

        it('should not create a badge when badge requirements are not fulfilled', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ skillIds, knowledgeElements, badge })
            .returns(false);

          // when
          await handleBadgeAcquisition({ assessment, ...dependencies, domainTransaction });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
        });
      });

      context('when the campaign is associated to two badges', function () {
        let badge1, badge2;
        let badgeId_1, badgeId_2;
        let skillIds;
        let knowledgeElements;

        beforeEach(function () {
          badgeId_1 = Symbol('badgeId_1');
          badgeId_2 = Symbol('badgeId_2');
          skillIds = Symbol('skillIds');
          knowledgeElements = Symbol('knowledgeElements');

          badge1 = new Badge({
            id: badgeId_1,
            badgeCriteria: Symbol('badgeCriteria'),
          });
          badge2 = new Badge({
            id: badgeId_2,
            badgeCriteria: Symbol('badgeCriteria'),
          });
          badgeRepository.findByCampaignParticipationId
            .withArgs({ campaignParticipationId: assessment.campaignParticipationId, domainTransaction })
            .resolves([badge1, badge2]);

          campaignRepository.findSkillIdsByCampaignParticipationId
            .withArgs({ campaignParticipationId: assessment.campaignParticipationId, domainTransaction })
            .resolves(skillIds);

          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId: assessment.userId, domainTransaction })
            .resolves(knowledgeElements);
        });

        it('should create one badge when only one badge requirements are fulfilled', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ skillIds, knowledgeElements, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ skillIds, knowledgeElements, badge: badge2 })
            .returns(false);

          // when
          await handleBadgeAcquisition({ assessment, ...dependencies, domainTransaction });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly({
            badgeAcquisitionsToCreate: [
              {
                badgeId: badge1.id,
                userId: assessment.userId,
                campaignParticipationId: assessment.campaignParticipationId,
              },
            ],
            domainTransaction,
          });
        });

        it('should create two badges when both badges requirements are fulfilled', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ skillIds, knowledgeElements, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ skillIds, knowledgeElements, badge: badge2 })
            .returns(true);

          // when
          await handleBadgeAcquisition({ assessment, ...dependencies, domainTransaction });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly({
            badgeAcquisitionsToCreate: [
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
            ],
            domainTransaction,
          });
        });
      });

      context('when the campaign is not associated to a badge', function () {
        it('should not create a badge', async function () {
          // given
          const userId = 42;
          const campaignParticipationId = 78;
          const assessment = new Assessment({ userId, campaignParticipationId });
          badgeRepository.findByCampaignParticipationId
            .withArgs({ campaignParticipationId: assessment.campaignParticipationId, domainTransaction })
            .resolves([]);

          // when
          await handleBadgeAcquisition({ assessment, ...dependencies, domainTransaction });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
        });
      });
    });

    context('when the assessment does not belong to a campaign', function () {
      it('should not create a badge', async function () {
        // given
        const userId = 42;
        const assessment = new Assessment({ userId });

        // when
        await handleBadgeAcquisition({ assessment, ...dependencies, domainTransaction });

        // then
        expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
      });
    });
  });
});
