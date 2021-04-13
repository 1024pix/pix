const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const shareCampaignResult = require('../../../../lib/domain/usecases/share-campaign-result');

describe('Unit | UseCase | share-campaign-result', () => {

  const campaignParticipationRepository = {
    get: sinon.stub(),
    updateWithSnapshot: sinon.stub(),
    isAssessmentCompleted: sinon.stub(),
  };
  const userId = 123;
  const campaignParticipationId = 456;

  context('when user is not the owner of the campaign participation', () => {

    it('throws a UserNotAuthorizedToAccessEntityError error ', async () => {
      // given
      campaignParticipationRepository.get.withArgs({ id: campaignParticipationId, options: { include: [ 'campaign' ] } }).resolves({ userId: userId + 1 });

      // when
      const error = await catchErr(shareCampaignResult)({ userId, campaignParticipationId, campaignParticipationRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('when user is the owner of the campaign participation', () => {

    it('updates the campaign participation', async () => {
      // given
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: campaignParticipationId, userId });
      sinon.stub(campaignParticipation, 'share');
      campaignParticipationRepository.get.withArgs({ id: campaignParticipationId, options: { include: [ 'campaign' ] } }).resolves(campaignParticipation);

      // when
      await shareCampaignResult({ userId, campaignParticipationId, campaignParticipationRepository });

      // then
      expect(campaignParticipation.share).to.have.been.called;
      expect(campaignParticipationRepository.updateWithSnapshot).to.have.been.calledWith(campaignParticipation);
    });

    it('returns the CampaignParticipationResultsShared event', async () => {
      // given
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: campaignParticipationId, userId });
      sinon.stub(campaignParticipation, 'share');

      campaignParticipationRepository.get.withArgs({ id: campaignParticipationId, options: { include: [ 'campaign' ] } }).resolves(campaignParticipation);

      // when
      const actualEvent = await shareCampaignResult({ userId, campaignParticipationId, campaignParticipationRepository });

      // then
      expect(actualEvent).to.deep.equal({ campaignParticipationId });
      expect(actualEvent).to.be.instanceOf(CampaignParticipationResultsShared);
    });
  });
});
