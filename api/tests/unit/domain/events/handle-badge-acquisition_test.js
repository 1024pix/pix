const _ = require('lodash');
const { expect, sinon, catchErr } = require('../../../test-helper');
const { handleBadgeAcquisition } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');

describe('Unit | Domain | Events | handle-badge-acquisition', () => {

  describe('#handleBadgeAcquisition', () => {
    const domainTransaction = Symbol('a DomainTransaction');

    const badgeRepository = {
      findByTargetProfileId: _.noop,
    };
    const badgeAcquisitionRepository = {
      create: _.noop,
    };
    const campaignParticipationResultRepository = {
      getByParticipationId: _.noop,
    };
    const badgeCriteriaService = {
      areBadgeCriteriaFulfilled: _.noop
    };

    const dependencies = {
      badgeAcquisitionRepository,
      badgeRepository,
      campaignParticipationResultRepository,
      badgeCriteriaService,
    };

    it('fails when event is not of correct type', async () => {
      // given
      const event = 'not an event of the correct type';
      // when / then
      const error = await catchErr(handleBadgeAcquisition)(
        { event, ...dependencies, domainTransaction }
      );

      // then
      expect(error).not.to.be.null;
    });
    context('when the assessment belongs to a campaign', () => {

      const event = new AssessmentCompleted(
        Symbol('userId'),
        Symbol('targetProfileId'),
        Symbol('campaignParticipationId')
      );

      context('when the campaign is associated to one badge', () => {

        let badge;
        const badgeId = Symbol('badgeId');
        const campaignParticipationResult = Symbol('campaignParticipationResult');

        beforeEach(() => {
          sinon.stub(badgeRepository, 'findByTargetProfileId');
          badge = {
            id: badgeId,
            badgeCriteria: Symbol('badgeCriteria')
          };
          badgeRepository.findByTargetProfileId.withArgs(event.targetProfileId).resolves([badge]);

          sinon.stub(badgeAcquisitionRepository, 'create');

          sinon.stub(campaignParticipationResultRepository, 'getByParticipationId');
          campaignParticipationResultRepository.getByParticipationId.withArgs(event.campaignParticipationId, [badge], []).resolves(
            campaignParticipationResult
          );

          sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
        });

        it('should create a badge when badge requirements are fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult, badge })
            .returns(true);

          // when
          await handleBadgeAcquisition({ event, ...dependencies, domainTransaction });

          // then
          expect(badgeAcquisitionRepository.create).to.have.been.calledWithExactly([{
            badgeId,
            userId: event.userId
          }], domainTransaction);
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

        const campaignParticipationResult = Symbol('campaignParticipationResult');

        beforeEach(() => {
          sinon.stub(badgeRepository, 'findByTargetProfileId');
          badge1 = {
            id: badgeId_1,
            badgeCriteria: Symbol('badgeCriteria')
          };
          badge2 = {
            id: badgeId_2,
            badgeCriteria: Symbol('badgeCriteria')
          };
          badgeRepository.findByTargetProfileId.withArgs(event.targetProfileId).resolves([badge1, badge2]);

          sinon.stub(badgeAcquisitionRepository, 'create');

          sinon.stub(campaignParticipationResultRepository, 'getByParticipationId');
          campaignParticipationResultRepository.getByParticipationId.withArgs(event.campaignParticipationId, [badge1, badge2], []).resolves(
            campaignParticipationResult
          );

          sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
        });

        it('should create one badge when only one badge requirements are fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult, badge: badge2 })
            .returns(false);

          // when
          await handleBadgeAcquisition({ event, ...dependencies, domainTransaction });

          // then
          expect(badgeAcquisitionRepository.create).to.have.been.calledWithExactly([{ badgeId: badge1.id, userId: event.userId }], domainTransaction);
        });

        it('should create two badges when both badges requirements are fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ campaignParticipationResult, badge: badge2 })
            .returns(true);

          // when
          await handleBadgeAcquisition({ event, ...dependencies, domainTransaction });

          // then
          expect(badgeAcquisitionRepository.create).to.have.been.calledWithExactly([
            { badgeId: badge1.id, userId: event.userId },
            { badgeId: badge2.id, userId: event.userId },
          ], domainTransaction);
        });
      });

      context('when the campaign is not associated to a badge', () => {
        it('should not create a badge', async () => {
          // given
          const targetProfileId = 1234;
          sinon.stub(badgeRepository, 'findByTargetProfileId');
          badgeRepository.findByTargetProfileId.withArgs(targetProfileId).resolves([]);

          sinon.stub(badgeAcquisitionRepository, 'create');

          const userId = 42;
          const event = new AssessmentCompleted(userId, targetProfileId);

          // when
          await handleBadgeAcquisition({ event, ...dependencies, domainTransaction });

          // then
          expect(badgeAcquisitionRepository.create).to.not.have.been.called;

        });
      });
    });

    context('when the assessment does not belong to a campaign', () => {
      it('should not create a badge', async () => {
        // given
        sinon.stub(badgeAcquisitionRepository, 'create');

        const targetProfileId = null;
        const userId = 42;
        const event = new AssessmentCompleted(userId, targetProfileId);

        // when
        await handleBadgeAcquisition({ event, ...dependencies, domainTransaction });

        // then
        expect(badgeAcquisitionRepository.create).to.not.have.been.called;
      });
    });

  });
});
