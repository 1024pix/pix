import { ParticipationResultCalculationJob } from '../../../../../../src/prescription/campaign-participation/domain/models/ParticipationResultCalculationJob.js';
import { ParticipationSharedJob } from '../../../../../../src/prescription/campaign-participation/domain/models/ParticipationSharedJob.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | share-campaign-result', function () {
  let campaignParticipationRepository;
  let userId;
  let campaignParticipationId;
  let participationResultCalculationJobRepository;
  let participationSharedJobRepository;

  beforeEach(function () {
    participationResultCalculationJobRepository = {
      performAsync: sinon.stub(),
    };
    participationSharedJobRepository = {
      performAsync: sinon.stub(),
    };
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
        participationResultCalculationJobRepository,
        participationSharedJobRepository,
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
        participationResultCalculationJobRepository,
        participationSharedJobRepository,
      });

      // then
      expect(campaignParticipation.share).to.have.been.called;
      expect(campaignParticipationRepository.updateWithSnapshot).to.have.been.calledWithExactly(campaignParticipation);
    });

    it('call jobs ParticipationResultCalculation and ParticipationShared', async function () {
      // given
      const campaignParticipation = domainBuilder.prescription.campaignParticipation.buildCampaignParticipation({
        id: campaignParticipationId,
        userId,
      });
      sinon.stub(campaignParticipation, 'share');

      campaignParticipationRepository.get.resolves(campaignParticipation);

      // when
      await usecases.shareCampaignResult({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
        participationResultCalculationJobRepository,
        participationSharedJobRepository,
      });

      // then
      expect(participationResultCalculationJobRepository.performAsync).to.have.been.calledOnceWithExactly(
        new ParticipationResultCalculationJob({ campaignParticipationId }),
      );
      expect(participationSharedJobRepository.performAsync).to.have.been.calledOnceWithExactly(
        new ParticipationSharedJob({ campaignParticipationId }),
      );
    });
  });
});
