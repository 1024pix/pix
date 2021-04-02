const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { handleBadgeAcquisition } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const BadgeResults = require('../../../../lib/domain/models/BadgeResults');

describe('Unit | Domain | Events | handle-badge-acquisition', () => {

  describe('#handleBadgeAcquisition', () => {
    let dependencies;
    let badgeRepository;
    let badgeAcquisitionRepository;
    let knowledgeElementRepository;
    let skillRepository;
    let badgeCriteriaService;

    beforeEach(() => {
      sinon.stub(BadgeResults, 'build');
      badgeRepository = { findByCampaignParticipationId: sinon.stub() };
      badgeAcquisitionRepository = { create: sinon.stub() };
      knowledgeElementRepository = { findUniqByUserId: sinon.stub() };
      skillRepository = { assessedDuringCampaignParticipation: sinon.stub() };
      badgeCriteriaService = { areBadgeCriteriaFulfilled: sinon.stub() };

      dependencies = {
        badgeAcquisitionRepository,
        badgeRepository,
        knowledgeElementRepository,
        skillRepository,
        badgeCriteriaService,
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('fails when event is not of correct type', async () => {
      // given
      const event = 'not an event of the correct type';
      // when / then
      const error = await catchErr(handleBadgeAcquisition)({ event, ...dependencies });

      // then
      expect(error).not.to.be.null;
    });

    context('when the assessment belongs to a campaign', () => {

      const event = new AssessmentCompleted({
        userId: 'userId',
        campaignParticipationId: 'campaignParticipationId',
      });

      context('when the campaign is associated to one badge', () => {

        let badge;
        const badgeId = Symbol('badgeId');
        const campaignParticipationResult = Symbol('campaignParticipationResult');
        const badgeResults = Symbol('BadgeResults');

        beforeEach(() => {
          badge = { id: badgeId, badgeCriteria: Symbol('badgeCriteria') };
          const badges = [badge];
          const knowledgeElements = [domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: 'validated' })];
          const skills = ['skillId1', 'skillId2'];

          badgeRepository.findByCampaignParticipationId.withArgs(event.campaignParticipationId).resolves(badges);
          knowledgeElementRepository.findUniqByUserId.withArgs({ userId: event.userId }).resolves(knowledgeElements);
          skillRepository.assessedDuringCampaignParticipation.withArgs(event.campaignParticipationId).resolves(skills);
          BadgeResults.build.withArgs(badges, skills, knowledgeElements).returns(badgeResults);
        });

        it('should create a badge when badge requirements are fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult: badgeResults, badge })
            .returns(true);

          // when
          await handleBadgeAcquisition({ event, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.create).to.have.been.calledWithExactly([{
            badgeId,
            userId: event.userId,
            campaignParticipationId: event.campaignParticipationId,
          }]);
        });

        it('should not create a badge when badge requirements are not fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult, badge })
            .returns(false);
          // when
          await handleBadgeAcquisition({ event, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.create).to.not.have.been.called;
        });
      });

      context('when the campaign is associated to two badges', () => {

        let badge1, badge2;
        const badgeId_1 = Symbol('badgeId_1');
        const badgeId_2 = Symbol('badgeId_2');
        const badgeResults = Symbol('BadgeResults');

        beforeEach(() => {
          badge1 = { id: badgeId_1, badgeCriteria: Symbol('badgeCriteria') };
          badge2 = { id: badgeId_2, badgeCriteria: Symbol('badgeCriteria') };
          const badges = [badge1, badge2];
          const knowledgeElements = [domainBuilder.buildKnowledgeElement({ skillId: 'skill1', status: 'validated' })];
          const skills = ['skillId1', 'skillId2'];

          badgeRepository.findByCampaignParticipationId.withArgs(event.campaignParticipationId).resolves(badges);
          knowledgeElementRepository.findUniqByUserId.withArgs({ userId: event.userId }).resolves(knowledgeElements);
          skillRepository.assessedDuringCampaignParticipation.withArgs(event.campaignParticipationId).resolves(skills);
          BadgeResults.build.withArgs(badges, skills, knowledgeElements).returns(badgeResults);
        });

        it('should create one badge when only one badge requirements are fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult: badgeResults, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult: badgeResults, badge: badge2 })
            .returns(false);

          // when
          await handleBadgeAcquisition({ event, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.create).to.have.been.calledWithExactly([{
            badgeId: badge1.id,
            userId: event.userId,
            campaignParticipationId: event.campaignParticipationId,
          }]);
        });

        it('should create two badges when both badges requirements are fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult: badgeResults, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult: badgeResults, badge: badge2 })
            .returns(true);

          // when
          await handleBadgeAcquisition({ event, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.create).to.have.been.calledWithExactly([
            { badgeId: badge1.id, userId: event.userId, campaignParticipationId: event.campaignParticipationId },
            { badgeId: badge2.id, userId: event.userId, campaignParticipationId: event.campaignParticipationId },
          ]);
        });
      });

      context('when the campaign is not associated to a badge', () => {
        it('should not create a badge', async () => {
          // given
          const userId = 42;
          const campaignParticipationId = 78;
          const event = new AssessmentCompleted({ userId, campaignParticipationId });
          badgeRepository.findByCampaignParticipationId.withArgs(event.campaignParticipationId).resolves([]);

          // when
          await handleBadgeAcquisition({ event, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.create).to.not.have.been.called;

        });
      });
    });

    context('when the assessment does not belong to a campaign', () => {
      it('should not create a badge', async () => {
        // given

        const userId = 42;
        const event = new AssessmentCompleted({ userId });

        // when
        await handleBadgeAcquisition({ event, ...dependencies });

        // then
        expect(badgeAcquisitionRepository.create).to.not.have.been.called;
      });
    });
  });
});
