import sinon from 'sinon';

import { getUserCampaignAssessmentResult } from '../../../../../../src/prescription/campaign-participation/domain/usecases/get-user-campaign-assessment-result.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import {
  NoCampaignParticipationForUserAndCampaign,
  NotFoundError,
} from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-user-campaign-assessment-result', function () {
  const locale = 'locale',
    campaignId = 123,
    userId = 456,
    campaignParticipationId = 789;
  let participantResultRepository,
    badgeRepository,
    stageRepository,
    stageAcquisitionRepository,
    knowledgeElementForParticipationService,
    campaignParticipationRepository,
    badgeForCalculationRepository;
  let compareStagesAndAcquiredStages;
  let args;

  beforeEach(function () {
    badgeForCalculationRepository = { findByCampaignId: sinon.stub() };
    campaignParticipationRepository = { findOneByCampaignIdAndUserId: sinon.stub() };
    knowledgeElementForParticipationService = { findUniqByUserOrCampaignParticipationId: sinon.stub() };
    badgeRepository = { findByCampaignId: sinon.stub() };
    participantResultRepository = {
      get: sinon.stub(),
    };
    stageRepository = { getByCampaignId: sinon.stub() };
    stageAcquisitionRepository = { getByCampaignParticipation: sinon.stub() };
    compareStagesAndAcquiredStages = { compare: sinon.stub() };
    args = {
      userId,
      campaignId,
      locale,
      badgeForCalculationRepository,
      knowledgeElementForParticipationService,
      badgeRepository,
      participantResultRepository,
      stageRepository,
      stageAcquisitionRepository,
      compareStagesAndAcquiredStages,
      campaignParticipationRepository,
    };
  });

  context('when NotFound error to catch is thrown during process', function () {
    it('should throw NoCampaignParticipationForUserAndCampaign error', async function () {
      // given
      badgeRepository.findByCampaignId.rejects(new NotFoundError());
      knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId.rejects('I should not be called');
      badgeForCalculationRepository.findByCampaignId.rejects('I should not be called');
      campaignParticipationRepository.findOneByCampaignIdAndUserId.withArgs({ userId, campaignId }).resolves(
        domainBuilder.buildCampaignParticipation({
          id: campaignParticipationId,
          status: CampaignParticipationStatuses.STARTED,
          userId,
          campaignId,
        }),
      );
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
      stageAcquisitionRepository.getByCampaignParticipation
        .withArgs(campaignParticipationId)
        .resolves([stageAcquisition]);
      compareStagesAndAcquiredStages.compare.withArgs([stage1, stage2], [stageAcquisition]).returns({
        reachedStageNumber: 1,
        totalNumberOfStages: 2,
        reachedStage: stage1,
      });
      knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId
        .withArgs({ userId, campaignParticipationId })
        .resolves([domainBuilder.buildKnowledgeElement()]);
      badgeForCalculationRepository.findByCampaignId
        .withArgs({ campaignId })
        .resolves([badgeForCalculationObtained1, badgeForCalculationNotObtained2, badgeForCalculationObtained3]);
      participantResultRepository.get
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
      campaignParticipationRepository.findOneByCampaignIdAndUserId
        .withArgs({
          userId,
          campaignId,
        })
        .resolves(
          domainBuilder.buildCampaignParticipation({
            id: campaignParticipationId,
            status: CampaignParticipationStatuses.SHARED,
            userId,
            campaignId,
          }),
        );
      // when
      const campaignAssessmentResult = await getUserCampaignAssessmentResult(args);

      // then
      expect(campaignAssessmentResult).to.deep.equal(expectedCampaignAssessmentResult);
    });
  });
});
