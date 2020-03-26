const { expect, sinon } = require('../../../test-helper');
const { badgeCreationHandler } = require('../../../../lib/domain/events/badge-creation-handler');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');
const campaignParticipationResultRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-result-repository');

describe('Unit | Domain | Events | badge-creation-handler', () => {

  describe('#handle', () => {
    const domainTransaction = Symbol('a DomainTransaction');

    context('when the assessment belongs to a campaign', () => {

      context('when the campaign is associated to a badge', () => {

        const event = new AssessmentCompleted(
          Symbol('userId'),
          Symbol('targetProfileId'),
          Symbol('campaignParticipationId')
        );

        const badgeId = Symbol('badgeId');

        const campaignParticipationResult = Symbol('campaignParticipationResult');

        beforeEach(() => {
          sinon.stub(badgeRepository, 'findOneByTargetProfileId');
          badgeRepository.findOneByTargetProfileId.withArgs(event.targetProfileId).resolves({ id: badgeId });

          sinon.stub(badgeAcquisitionRepository, 'create');

          sinon.stub(campaignParticipationResultRepository, 'getByParticipationId');
          campaignParticipationResultRepository.getByParticipationId.withArgs(event.campaignParticipationId).resolves(
            campaignParticipationResult
          );

          sinon.stub(badgeCriteriaService, 'areBadgeCriteriaFulfilled');
        });

        it('should create a badge when badge requirements are fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ campaignParticipationResult }).returns(true);

          // when
          await badgeCreationHandler.handle(domainTransaction, event);

          // then
          expect(badgeAcquisitionRepository.create).to.have.been.calledWithExactly(domainTransaction, { badgeId, userId: event.userId });
        });

        it('should not create a badge when badge requirements are not fulfilled', async () => {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ campaignParticipationResult }).returns(false);
          // when
          await badgeCreationHandler.handle(domainTransaction, event);

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
          await badgeCreationHandler.handle(domainTransaction, event);

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
        await badgeCreationHandler.handle(domainTransaction, event);

        // then
        expect(badgeAcquisitionRepository.create).to.not.have.been.called;
      });
    });
  });
});
