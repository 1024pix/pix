import { expect, sinon, domainBuilder } from '../../../test-helper';
import handleBadgeAcquisition from '../../../../lib/domain/usecases/handle-badge-acquisition';

describe('Unit | UseCase | handle-badge-acquisition', function () {
  let domainTransaction;
  let badgeForCalculationRepository, badgeAcquisitionRepository, knowledgeElementRepository;
  let args;

  beforeEach(function () {
    badgeForCalculationRepository = { findByCampaignParticipationId: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    badgeAcquisitionRepository = { createOrUpdate: sinon.stub() };
    domainTransaction = Symbol('domainTransaction');
    args = {
      badgeForCalculationRepository,
      knowledgeElementRepository,
      badgeAcquisitionRepository,
      domainTransaction,
    };
  });

  context('when assessment is not of type campaign', function () {
    it('should not attempt to create any badge acquisition', async function () {
      // given
      badgeForCalculationRepository.findByCampaignParticipationId.rejects('I should not be called');
      knowledgeElementRepository.findUniqByUserId.rejects('I should not be called');
      const assessmentCertification = domainBuilder.buildAssessment.ofTypeCertification();
      const assessmentCompetenceEvaluation = domainBuilder.buildAssessment.ofTypeCompetenceEvaluation();

      // when
      await handleBadgeAcquisition({ ...args, assessment: assessmentCertification });
      await handleBadgeAcquisition({ ...args, assessment: assessmentCompetenceEvaluation });

      // then
      expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
    });
  });

  context('when assessment is of type campaign', function () {
    const userId = 123,
      campaignParticipationId = 456;

    beforeEach(function () {
      const assessment = domainBuilder.buildAssessment.ofTypeCampaign({ userId, campaignParticipationId });
      args = { ...args, assessment };
    });

    context('when campaign has no badges', function () {
      it('should not attempt to create any badge acquisition', async function () {
        // given
        badgeForCalculationRepository.findByCampaignParticipationId
          .withArgs({ campaignParticipationId, domainTransaction })
          .resolves([]);
        knowledgeElementRepository.findUniqByUserId.rejects('I should not be called');

        // when
        await handleBadgeAcquisition(args);

        // then
        expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
      });
    });

    context('when campaign has badges', function () {
      let badgeObtained1, badgeNotObtained2, badgeObtained3;

      beforeEach(function () {
        badgeObtained1 = domainBuilder.buildBadgeForCalculation.mockObtainable({ id: 1 });
        badgeNotObtained2 = domainBuilder.buildBadgeForCalculation.mockNotObtainable({ id: 2 });
        badgeObtained3 = domainBuilder.buildBadgeForCalculation.mockObtainable({ id: 3 });
      });

      it('should create or update badge acquisitions of obtained badges', async function () {
        // given
        badgeForCalculationRepository.findByCampaignParticipationId
          .withArgs({ campaignParticipationId, domainTransaction })
          .resolves([badgeObtained1, badgeNotObtained2, badgeObtained3]);
        knowledgeElementRepository.findUniqByUserId
          .withArgs({ userId, domainTransaction })
          .resolves([domainBuilder.buildKnowledgeElement()]);

        // when
        await handleBadgeAcquisition(args);

        // then
        const badgeAcquisitionsToCreate = [
          { badgeId: badgeObtained1.id, userId, campaignParticipationId },
          { badgeId: badgeObtained3.id, userId, campaignParticipationId },
        ];
        expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledOnce;
        expect(badgeAcquisitionRepository.createOrUpdate.firstCall).to.have.been.calledWithExactly({
          badgeAcquisitionsToCreate,
          domainTransaction,
        });
      });
    });
  });
});
