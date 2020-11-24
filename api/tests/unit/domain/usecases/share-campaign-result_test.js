const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');
const { AssessmentNotCompletedError, UserNotAuthorizedToAccessEntity, ArchivedCampaignError } = require('../../../../lib/domain/errors');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | share-campaign-result', () => {
  const campaignParticipationRepository = {
    get: sinon.stub(),
    share: sinon.stub(),
    isAssessmentCompleted: sinon.stub(),
  };
  const campaignRepository = {
    get: sinon.stub(),
  };
  const userId = 123;
  const campaignParticipationId = 456;
  const campaignId = 789;
  const organizationId = 159;

  it('should throw a UserNotAuthorizedToAccessEntity error when user is not the owner of the campaign participation', async () => {
    // given
    campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ userId: userId + 1 });

    // when
    const error = await catchErr(usecases.shareCampaignResult)({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
  });

  it('should throw a ArchivedCampaignError error when campaign is archived', async () => {
    // given
    campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ userId, campaignId });
    campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign({ id: campaignId, archivedAt: new Date('1990-11-04') }));

    // when
    const error = await catchErr(usecases.shareCampaignResult)({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository });

    // then
    expect(error).to.be.instanceOf(ArchivedCampaignError);
  });

  context('when the campaign is of type assessment', () => {
    it('should throw a AssessmentNotCompletedError error when latest assessment of participation is not completed', async () => {
      // given
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ userId, campaignId });
      campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign.ofTypeAssessment({ id: campaignId, archivedAt: null }));
      campaignParticipationRepository.isAssessmentCompleted.withArgs(campaignParticipationId).resolves(false);

      // when
      const error = await catchErr(usecases.shareCampaignResult)({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository });

      // then
      expect(error).to.be.instanceOf(AssessmentNotCompletedError);
    });

    it('should share successfully the participation when latest assessment is completed', async () => {
      // given
      const campaignParticipation = { id: campaignParticipationId, userId, campaignId };
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign.ofTypeAssessment({ id: campaignId, archivedAt: null }));
      campaignParticipationRepository.isAssessmentCompleted.withArgs(campaignParticipationId).resolves(true);

      // when
      await usecases.shareCampaignResult({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository });

      // then
      expect(campaignParticipationRepository.share).to.have.been.calledWith(campaignParticipation);
    });

    it('should return the CampaignParticipationResultsShared event', async () => {
      // given
      const campaignParticipation = { id: campaignParticipationId, userId, campaignId };
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign.ofTypeAssessment({ id: campaignId, archivedAt: null, organizationId }));
      campaignParticipationRepository.isAssessmentCompleted.withArgs(campaignParticipationId).resolves(true);

      // when
      const actualEvent = await usecases.shareCampaignResult({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository });

      // then
      expect(actualEvent).to.deep.equal({ campaignParticipationId });
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
      await usecases.shareCampaignResult({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository });

      // then
      expect(campaignParticipationRepository.share).to.have.been.calledWith(campaignParticipation);
    });

    it('should return the CampaignParticipationResultsShared event', async () => {
      // given
      const campaignParticipation = { id: campaignParticipationId, userId, campaignId };
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.get.withArgs(campaignId).resolves(domainBuilder.buildCampaign.ofTypeProfilesCollection({ id: campaignId, archivedAt: null, organizationId }));

      // when
      const actualEvent = await usecases.shareCampaignResult({ userId, campaignParticipationId, campaignParticipationRepository, campaignRepository });

      // then
      expect(actualEvent).to.deep.equal({ campaignParticipationId });
      expect(actualEvent).to.be.instanceOf(CampaignParticipationResultsShared);
    });
  });
});
