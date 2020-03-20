const { expect, sinon } = require('../../../test-helper');
const { cleaBadgeCreationHandler } = require('../../../../lib/domain/events/clea-badge-creation-handler');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');

describe('Unit | Domain | Events | clea-badge-creation-handler', () => {
  describe('#handle', () => {
    context('when the assessment belongs to a campaign', () => {
      context('when the campaign is associated to a badge', () => {

        const event = new AssessmentCompleted(
          Symbol('userId'),
          Symbol('targetProfileId'),
          Symbol('campaignParticipationId')
        );

        const badgeId = Symbol('badgeId');

        const campaignParticipationResult = Symbol('campaignParticipationResult');

        let campaignParticipationResultFactory;
        let badgeCriteriaService;

        beforeEach(() => {
          sinon.stub(badgeRepository, 'findOneByTargetProfileId');
          badgeRepository.findOneByTargetProfileId.withArgs(event.targetProfileId).resolves({ id: badgeId });

          sinon.stub(badgeAcquisitionRepository, 'create');

          campaignParticipationResultFactory = initializeCampaignParticipationResultFactoryStub();
          campaignParticipationResultFactory.create.withArgs(event.campaignParticipationId).resolves(
            campaignParticipationResult
          );

          badgeCriteriaService = initializeBadgeCriteriaServiceStub();
        });

        it('should create a badge when badge requirements are fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ campaignParticipationResult }).returns(true);
          // when
          await cleaBadgeCreationHandler.inject(
            campaignParticipationResultFactory,
            badgeCriteriaService
          ).handle(event);

          // then
          expect(badgeAcquisitionRepository.create).to.have.been.calledWithExactly({ badgeId, userId: event.userId });
        });

        it('should not create a badge when badge requirements are not fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ campaignParticipationResult }).returns(false);
          // when
          await cleaBadgeCreationHandler.inject(
            campaignParticipationResultFactory,
            badgeCriteriaService
          ).handle(event);

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
          const event = new AssessmentCompleted(userId, targetProfileId);

          // when
          await cleaBadgeCreationHandler.inject().handle(event);

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
        await cleaBadgeCreationHandler.inject().handle(event);

        // then
        expect(badgeAcquisitionRepository.create).to.not.have.been.called;
      });
    });
  });
});

function initializeCampaignParticipationResultFactoryStub() {
  const campaignParticipationResultFactory = {
    create() {
    }
  };
  sinon.stub(campaignParticipationResultFactory, 'create');
  return campaignParticipationResultFactory;
}

function initializeBadgeCriteriaServiceStub() {
  const badgeCriteriaService = {
    areBadgeCriteriaFulfilled() {
    }
  };
  sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
  return badgeCriteriaService;
}
