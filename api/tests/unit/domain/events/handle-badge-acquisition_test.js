const _ = require('lodash');
const { expect, sinon, catchErr } = require('../../../test-helper');
const { handleBadgeAcquisition } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');

describe('Unit | Domain | Events | handle-badge-acquisition', function() {

  describe('#handleBadgeAcquisition', function() {
    const badgeRepository = {
      findByCampaignParticipationId: _.noop,
    };
    const targetProfileRepository = {
      getByCampaignParticipationId: _.noop,
    };
    const knowledgeElementRepository = {
      findUniqByUserId: _.noop,
    };
    const badgeAcquisitionRepository = {
      createOrUpdate: _.noop,
    };

    const badgeCriteriaService = {
      areBadgeCriteriaFulfilled: _.noop,
    };

    const dependencies = {
      badgeAcquisitionRepository,
      badgeCriteriaService,
      badgeRepository,
      knowledgeElementRepository,
      targetProfileRepository,
    };

    it('fails when event is not of correct type', async function() {
      // given
      const event = 'not an event of the correct type';
      // when / then
      const error = await catchErr(handleBadgeAcquisition)(
        { event, ...dependencies },
      );

      // then
      expect(error).not.to.be.null;
    });
    context('when the assessment belongs to a campaign', function() {

      const event = new AssessmentCompleted({
        userId: 'userId',
        campaignParticipationId: 'campaignParticipationId',
      });

      context('when the campaign is associated to one badge', function() {

        let badge;
        const badgeId = Symbol('badgeId');
        const targetProfile = Symbol('targetProfile');
        const knowledgeElements = Symbol('knowledgeElements');

        beforeEach(function() {
          sinon.stub(badgeRepository, 'findByCampaignParticipationId');
          badge = {
            id: badgeId,
            badgeCriteria: Symbol('badgeCriteria'),
          };
          badgeRepository.findByCampaignParticipationId.withArgs(event.campaignParticipationId).resolves([badge]);

          sinon.stub(targetProfileRepository, 'getByCampaignParticipationId');
          targetProfileRepository.getByCampaignParticipationId.withArgs(event.campaignParticipationId).resolves(targetProfile);

          sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
          knowledgeElementRepository.findUniqByUserId.withArgs({ userId: event.userId }).resolves(knowledgeElements);
          sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
          sinon.stub(badgeAcquisitionRepository, 'createOrUpdate');
        });

        it('should create a badge when badge requirements are fulfilled', async function() {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge })
            .returns(true);

          // when
          await handleBadgeAcquisition({ event, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly([{
            badgeId,
            userId: event.userId,
            campaignParticipationId: event.campaignParticipationId,
          }]);
        });

        it('should not create a badge when badge requirements are not fulfilled', async function() {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge })
            .returns(false);
          // when
          await handleBadgeAcquisition({ event, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
        });
      });

      context('when the campaign is associated to two badges', function() {

        let badge1, badge2;
        const badgeId_1 = Symbol('badgeId_1');
        const badgeId_2 = Symbol('badgeId_2');
        const targetProfile = Symbol('targetProfile');
        const knowledgeElements = Symbol('knowledgeElements');

        beforeEach(function() {
          sinon.stub(badgeRepository, 'findByCampaignParticipationId');
          badge1 = {
            id: badgeId_1,
            badgeCriteria: Symbol('badgeCriteria'),
          };
          badge2 = {
            id: badgeId_2,
            badgeCriteria: Symbol('badgeCriteria'),
          };
          badgeRepository.findByCampaignParticipationId.withArgs(event.campaignParticipationId).resolves([badge1, badge2]);

          sinon.stub(targetProfileRepository, 'getByCampaignParticipationId');
          targetProfileRepository.getByCampaignParticipationId.withArgs(event.campaignParticipationId).resolves(targetProfile);

          sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
          knowledgeElementRepository.findUniqByUserId.withArgs({ userId: event.userId }).resolves(knowledgeElements);

          sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
          sinon.stub(badgeAcquisitionRepository, 'createOrUpdate');
        });

        it('should create one badge when only one badge requirements are fulfilled', async function() {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge: badge2 })
            .returns(false);

          // when
          await handleBadgeAcquisition({ event, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly([{
            badgeId: badge1.id,
            userId: event.userId,
            campaignParticipationId: event.campaignParticipationId,
          }]);
        });

        it('should create two badges when both badges requirements are fulfilled', async function() {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ targetProfile, knowledgeElements, badge: badge2 })
            .returns(true);

          // when
          await handleBadgeAcquisition({ event, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly([
            { badgeId: badge1.id, userId: event.userId, campaignParticipationId: event.campaignParticipationId },
            { badgeId: badge2.id, userId: event.userId, campaignParticipationId: event.campaignParticipationId },
          ]);
        });
      });

      context('when the campaign is not associated to a badge', function() {
        it('should not create a badge', async function() {
          // given
          const userId = 42;
          const campaignParticipationId = 78;
          const event = new AssessmentCompleted({ userId, campaignParticipationId });
          sinon.stub(badgeRepository, 'findByCampaignParticipationId');
          badgeRepository.findByCampaignParticipationId.withArgs(event.campaignParticipationId).resolves([]);

          sinon.stub(badgeAcquisitionRepository, 'createOrUpdate');

          // when
          await handleBadgeAcquisition({ event, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;

        });
      });
    });

    context('when the assessment does not belong to a campaign', function() {
      it('should not create a badge', async function() {
        // given
        sinon.stub(badgeAcquisitionRepository, 'createOrUpdate');

        const userId = 42;
        const event = new AssessmentCompleted({ userId });

        // when
        await handleBadgeAcquisition({ event, ...dependencies });

        // then
        expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
      });
    });

  });
});
