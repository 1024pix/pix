import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper.js';
import { getUserCampaignAssessmentResult } from '../../../../lib/domain/usecases/get-user-campaign-assessment-result.js';
import { NotFoundError, NoCampaignParticipationForUserAndCampaign } from '../../../../lib/domain/errors.js';
import { CampaignParticipationStatuses } from '../../../../lib/domain/models/index.js';

describe('Unit | UseCase | get-user-campaign-assessment-result', function () {
  const locale = 'locale',
    campaignId = 123,
    userId = 456;
  let participantResultRepository, badgeRepository, stageRepository, stageAcquisitionRepository;
  let compareStagesAndAcquiredStages;
  let knowledgeElementRepository, badgeForCalculationRepository;
  let args;

  beforeEach(function () {
    badgeForCalculationRepository = { findByCampaignId: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    badgeRepository = { findByCampaignId: sinon.stub() };
    participantResultRepository = {
      getByUserIdAndCampaignId: sinon.stub(),
      getCampaignParticipationStatus: sinon.stub(),
    };
    stageRepository = { getByCampaignId: sinon.stub() };
    stageAcquisitionRepository = { getByCampaignIdAndUserId: sinon.stub() };
    compareStagesAndAcquiredStages = { compare: sinon.stub() };
    args = {
      userId,
      campaignId,
      locale,
      badgeForCalculationRepository,
      knowledgeElementRepository,
      badgeRepository,
      participantResultRepository,
      stageRepository,
      stageAcquisitionRepository,
      compareStagesAndAcquiredStages,
    };
  });

  context('when NotFound error to catch is thrown during process', function () {
    it('should throw NoCampaignParticipationForUserAndCampaign error', async function () {
      // given
      badgeRepository.findByCampaignId.rejects(new NotFoundError());
      knowledgeElementRepository.findUniqByUserId.rejects('I should not be called');
      badgeForCalculationRepository.findByCampaignId.rejects('I should not be called');
      participantResultRepository.getCampaignParticipationStatus.returns(CampaignParticipationStatuses.STARTED);
      // when
      const error = await catchErr(getUserCampaignAssessmentResult)(args);

      // then
      expect(error).to.be.instanceOf(NoCampaignParticipationForUserAndCampaign);
    });
  });

  context('when no error to catch is thrown during process', function () {
    it('should return the assessment result with badges validity', async function () {
      // given
      const expectedCampaignAssessmentResult = Symbol('campaign assessment result');
      const badge1 = domainBuilder.buildBadge({ id: 1 });
      const badgeForCalculationObtained1 = domainBuilder.buildBadgeForCalculation.mockObtainable({ id: badge1.id });
      const badge2 = domainBuilder.buildBadge({ id: 2 });
      const badgeForCalculationNotObtained2 = domainBuilder.buildBadgeForCalculation.mockNotObtainable({
        id: badge2.id,
      });
      const badge3 = domainBuilder.buildBadge({ id: 3 });
      const badgeForCalculationObtained3 = domainBuilder.buildBadgeForCalculation.mockObtainable({ id: badge3.id });
      badgeRepository.findByCampaignId.withArgs(campaignId).resolves([badge1, badge2, badge3]);
      const stage1 = domainBuilder.buildStage();
      const stage2 = domainBuilder.buildStage();
      const stageAcquisition = domainBuilder.buildStageAcquisition();
      stageRepository.getByCampaignId.withArgs(campaignId).resolves([stage1, stage2]);
      stageAcquisitionRepository.getByCampaignIdAndUserId.withArgs(campaignId, userId).resolves([stageAcquisition]);
      compareStagesAndAcquiredStages.compare.withArgs([stage1, stage2], [stageAcquisition]).returns({
        reachedStageNumber: 1,
        totalNumberOfStages: 2,
        reachedStage: stage1,
      });
      knowledgeElementRepository.findUniqByUserId
        .withArgs({ userId })
        .resolves([domainBuilder.buildKnowledgeElement()]);
      badgeForCalculationRepository.findByCampaignId
        .withArgs({ campaignId })
        .resolves([badgeForCalculationObtained1, badgeForCalculationNotObtained2, badgeForCalculationObtained3]);
      participantResultRepository.getByUserIdAndCampaignId
        .withArgs({
          userId,
          campaignId,
          locale,
          badges: [
            {
              ...badge1,
              isValid: true,
              acquisitionPercentage: badgeForCalculationObtained1.getAcquisitionPercentage(),
            },
            {
              ...badge2,
              isValid: false,
              acquisitionPercentage: badgeForCalculationNotObtained2.getAcquisitionPercentage(),
            },
            {
              ...badge3,
              isValid: true,
              acquisitionPercentage: badgeForCalculationObtained3.getAcquisitionPercentage(),
            },
          ],
          stages: [stage1, stage2],
          reachedStage: {
            ...stage1,
            totalStage: 2,
            reachedStage: 1,
          },
        })
        .resolves(expectedCampaignAssessmentResult);
      participantResultRepository.getCampaignParticipationStatus
        .withArgs({
          userId,
          campaignId,
        })
        .resolves(CampaignParticipationStatuses.SHARED);
      // when
      const campaignAssessmentResult = await getUserCampaignAssessmentResult(args);

      // then
      expect(campaignAssessmentResult).to.deep.equal(expectedCampaignAssessmentResult);
    });
  });
});
