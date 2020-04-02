const _ = require('lodash');

const { expect, sinon } = require('../../../test-helper');
const events = require('../../../../lib/domain/events');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');

describe('Unit | Domain | Events | handle-badge-acquisition', () => {

  describe('#handleBadgeAcquisition', () => {
    const domainTransaction = Symbol('a DomainTransaction');

    const badgeRepository = {
      findOneByTargetProfileId: _.noop,
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

    context('when the assessment belongs to a campaign', () => {

      context('when the campaign is associated to a badge', () => {

        const assessmentCompletedEvent = new AssessmentCompleted(
          Symbol('userId'),
          Symbol('targetProfileId'),
          Symbol('campaignParticipationId')
        );

        const badgeId = Symbol('badgeId');

        const campaignParticipationResult = Symbol('campaignParticipationResult');

        beforeEach(() => {
          sinon.stub(badgeRepository, 'findOneByTargetProfileId');
          const badge = { id: badgeId };
          badgeRepository.findOneByTargetProfileId.withArgs(assessmentCompletedEvent.targetProfileId).resolves(badge);

          sinon.stub(badgeAcquisitionRepository, 'create');

          sinon.stub(campaignParticipationResultRepository, 'getByParticipationId');
          campaignParticipationResultRepository.getByParticipationId.withArgs(assessmentCompletedEvent.campaignParticipationId, badge).resolves(
            campaignParticipationResult
          );

          sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
        });

        it('should create a badge when badge requirements are fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ campaignParticipationResult }).returns(true);

          // when
          await events.handleBadgeAcquisition({ domainTransaction, assessmentCompletedEvent, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.create).to.have.been.calledWithExactly(domainTransaction, { badgeId, userId: assessmentCompletedEvent.userId });
        });

        it('should not create a badge when badge requirements are not fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ campaignParticipationResult }).returns(false);
          // when
          await events.handleBadgeAcquisition({ domainTransaction, assessmentCompletedEvent, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.create).to.not.have.been.called;
        });
      });

      context('when the campaign is not associated to a badge', () => {
        it('should not create a badge', async () => {
          // given
          const targetProfileId = 1234;
          sinon.stub(badgeRepository, 'findOneByTargetProfileId');
          badgeRepository.findOneByTargetProfileId.withArgs(targetProfileId).resolves(null);

          sinon.stub(badgeAcquisitionRepository, 'create');

          const userId = 42;
          const assessmentCompletedEvent = new AssessmentCompleted(userId, targetProfileId);

          // when
          await events.handleBadgeAcquisition({ domainTransaction, assessmentCompletedEvent, ...dependencies });

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
        const assessmentCompletedEvent = new AssessmentCompleted(userId, targetProfileId);

        // when
        await events.handleBadgeAcquisition({ domainTransaction, assessmentCompletedEvent, ...dependencies });

        // then
        expect(badgeAcquisitionRepository.create).to.not.have.been.called;
      });
    });
  });
});
