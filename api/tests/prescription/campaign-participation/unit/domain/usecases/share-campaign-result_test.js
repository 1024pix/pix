import { CampaignParticipationResultsShared } from '../../../../../../lib/domain/events/CampaignParticipationResultsShared.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | share-campaign-result', function () {
  let campaignParticipationRepository;
  let userId;
  let campaignParticipationId;

  beforeEach(function () {
    campaignParticipationRepository = {
      get: sinon.stub(),
      updateWithSnapshot: sinon.stub(),
    };
    userId = 123;
    campaignParticipationId = 456;
  });

  context('when user is not the owner of the campaign participation', function () {
    it('throws a UserNotAuthorizedToAccessEntityError error ', async function () {
      // given
      campaignParticipationRepository.get.resolves({ userId: userId + 1 });

      // when
      const error = await catchErr(usecases.shareCampaignResult)({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('when user is the owner of the campaign participation', function () {
    it('updates the campaign participation', async function () {
      // given
      const campaignParticipation = domainBuilder.prescription.campaignParticipation.buildCampaignParticipation({
        id: campaignParticipationId,
        userId,
      });
      sinon.stub(campaignParticipation, 'share');
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);

      // when
      await usecases.shareCampaignResult({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
      });

      // then
      expect(campaignParticipation.share).to.have.been.called;
      expect(campaignParticipationRepository.updateWithSnapshot).to.have.been.calledWithExactly(campaignParticipation);
    });

    it('returns the CampaignParticipationResultsShared event', async function () {
      // given
      const campaignParticipation = domainBuilder.prescription.campaignParticipation.buildCampaignParticipation({
        id: campaignParticipationId,
        userId,
      });
      sinon.stub(campaignParticipation, 'share');

      campaignParticipationRepository.get.resolves(campaignParticipation);

      // when
      const actualEvent = await usecases.shareCampaignResult({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
      });

      // then
      expect(actualEvent).to.deep.equal({ campaignParticipationId });
      expect(actualEvent).to.be.instanceOf(CampaignParticipationResultsShared);
    });
  });
});
