import { sinon, expect, domainBuilder, catchErr } from '../../../../test-helper.js';
import { findCampaignParticipationTrainings } from '../../../../../src/devcomp/domain/usecases/find-campaign-participation-trainings.js';
import { UserNotAuthorizedToFindTrainings } from '../../../../../lib/domain/errors.js';

describe('Unit | UseCase | find-campaign-participation-trainings', function () {
  let campaignParticipationRepository;
  let userRecommendedTrainingRepository;

  beforeEach(function () {
    campaignParticipationRepository = { get: sinon.stub() };
    userRecommendedTrainingRepository = { findByCampaignParticipationId: sinon.stub() };
  });

  context('when authenticated user is not the campaign participation owner', function () {
    it('should throw UserNotAuthorizedToFindTrainings error', async function () {
      // given
      const userId = 1234;
      const campaignWithoutTargetProfileId = domainBuilder.buildCampaign({ targetProfile: null });
      const campaignParticipation = domainBuilder.buildCampaignParticipation({
        campaign: campaignWithoutTargetProfileId,
        userId: 5678,
      });
      campaignParticipationRepository.get.resolves(campaignParticipation);

      // when
      const error = await catchErr(findCampaignParticipationTrainings)({
        userId,
        campaignParticipationId: campaignParticipation.id,
        campaignParticipationRepository,
        userRecommendedTrainingRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToFindTrainings);
    });
  });

  context('when authenticated user is the campaign participation owner', function () {
    it('should return array of recommended trainings', async function () {
      // given
      const userId = 123;
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ userId });
      campaignParticipationRepository.get.resolves(campaignParticipation);
      const trainings = Symbol('trainings');
      userRecommendedTrainingRepository.findByCampaignParticipationId.resolves(trainings);

      // when
      const result = await findCampaignParticipationTrainings({
        userId,
        campaignParticipationId: campaignParticipation.id,
        locale: 'fr-fr',
        campaignParticipationRepository,
        userRecommendedTrainingRepository,
      });

      // then
      expect(result).to.deep.equal(trainings);
      expect(userRecommendedTrainingRepository.findByCampaignParticipationId).to.have.been.calledWithExactly({
        campaignParticipationId: campaignParticipation.id,
        locale: 'fr-fr',
      });
    });
  });
});
