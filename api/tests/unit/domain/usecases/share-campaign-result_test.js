const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');
const { AlreadySharedCampaignParticipationError, AssessmentNotCompletedError, UserNotAuthorizedToAccessEntity, ArchivedCampaignError } = require('../../../../lib/domain/errors');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const CampaignAssessmentInfo = require('../../../../lib/domain/read-models/CampaignAssessmentInfo');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | share-campaign-result2', () => {
  const campaignParticipationRepository = {
    get: sinon.stub(),
    share: sinon.stub(),
  };
  const campaignRepository = {
    get: sinon.stub(),
  };
  const campaignAssessmentInfoRepository = {
    getByCampaignParticipationId: sinon.stub(),
  };
  const userId = 123;
  const campaignParticipationId = 456;
  const campaignId = 789;
  const organizationId = 159;

  it('should throw a UserNotAuthorizedToAccessEntity error when user is not the owner of the campaign participation', async () => {
    // given
    campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ userId: userId + 1 });

    // when
    const error = await catchErr(usecases.shareCampaignResult)({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository, campaignAssessmentInfoRepository });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
  });

  it('should throw a ArchivedCampaignError error when campaign is archived', async () => {
    // given
    campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ userId, campaignId });
    campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign({ id: campaignId, archivedAt: new Date('1990-11-04') }));

    // when
    const error = await catchErr(usecases.shareCampaignResult)({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository, campaignAssessmentInfoRepository });

    // then
    expect(error).to.be.instanceOf(ArchivedCampaignError);
  });

  context('when the campaign is of type assessment', () => {
    it('should throw a AssessmentNotCompletedError error when latest assessment of participation is not completed', async () => {
      // given
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ userId, campaignId });
      campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign.ofTypeAssessment({ id: campaignId, archivedAt: null }));
      campaignAssessmentInfoRepository.getByCampaignParticipationId
        .withArgs(campaignParticipationId)
        .resolves(domainBuilder.buildCampaignAssessmentInfo({ campaignParticipationId, status: CampaignAssessmentInfo.statuses.ONGOING }));

      // when
      const error = await catchErr(usecases.shareCampaignResult)({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository, campaignAssessmentInfoRepository });

      // then
      expect(error).to.be.instanceOf(AssessmentNotCompletedError);
    });

    it('should throw a AlreadySharedCampaignParticipationError error when the participation is already shared', async () => {
      // given
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ userId, campaignId });
      campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign.ofTypeAssessment({ id: campaignId, archivedAt: null }));
      campaignAssessmentInfoRepository.getByCampaignParticipationId
        .withArgs(campaignParticipationId)
        .resolves(domainBuilder.buildCampaignAssessmentInfo({ campaignParticipationId, status: CampaignAssessmentInfo.statuses.SHARED }));

      // when
      const error = await catchErr(usecases.shareCampaignResult)({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository, campaignAssessmentInfoRepository });

      // then
      expect(error).to.be.instanceOf(AlreadySharedCampaignParticipationError);
    });

    it('should share successfully the participation when assessment is completed', async () => {
      // given
      const campaignParticipation = { id: campaignParticipationId, userId, campaignId };
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign.ofTypeAssessment({ id: campaignId, archivedAt: null }));
      campaignAssessmentInfoRepository.getByCampaignParticipationId
        .withArgs(campaignParticipationId)
        .resolves(domainBuilder.buildCampaignAssessmentInfo({ campaignParticipationId, status: CampaignAssessmentInfo.statuses.COMPLETED }));

      // when
      await usecases.shareCampaignResult({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository, campaignAssessmentInfoRepository });

      // then
      expect(campaignParticipationRepository.share).to.have.been.calledWith(campaignParticipation);
    });

    it('should return the CampaignParticipationResultsShared event', async () => {
      // given
      const campaignParticipation = { id: campaignParticipationId, userId, campaignId };
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign.ofTypeAssessment({ id: campaignId, archivedAt: null, organizationId }));
      campaignAssessmentInfoRepository.getByCampaignParticipationId
        .withArgs(campaignParticipationId)
        .resolves(domainBuilder.buildCampaignAssessmentInfo({ campaignParticipationId, status: CampaignAssessmentInfo.statuses.COMPLETED }));

      // when
      const actualEvent = await usecases.shareCampaignResult({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository, campaignAssessmentInfoRepository });

      // then
      expect(actualEvent).to.deep.equal({
        campaignId,
        isAssessment: true,
        campaignParticipationId,
        userId,
        organizationId,
      });
      expect(actualEvent).to.be.instanceOf(CampaignParticipationResultsShared);
    });
  });

  context('when the campaign is of type profiles collection', () => {
    it('should share successfully the participation', async () => {
      // given
      const campaignParticipation = { id: campaignParticipationId, userId, campaignId };
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign.ofTypeProfilesCollection({ id: campaignId, archivedAt: null }));

      // when
      await usecases.shareCampaignResult({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository, campaignAssessmentInfoRepository });

      // then
      expect(campaignParticipationRepository.share).to.have.been.calledWith(campaignParticipation);
    });

    it('should return the CampaignParticipationResultsShared event', async () => {
      // given
      const campaignParticipation = { id: campaignParticipationId, userId, campaignId };
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign.ofTypeProfilesCollection({ id: campaignId, archivedAt: null, organizationId }));

      // when
      const actualEvent = await usecases.shareCampaignResult({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository, campaignAssessmentInfoRepository });

      // then
      expect(actualEvent).to.deep.equal({
        campaignId,
        isAssessment: false,
        campaignParticipationId,
        userId,
        organizationId,
      });
      expect(actualEvent).to.be.instanceOf(CampaignParticipationResultsShared);
    });
  });
});
