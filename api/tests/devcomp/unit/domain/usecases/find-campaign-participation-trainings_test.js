import { expect } from 'chai';
import sinon from 'sinon';

import { UserNotAuthorizedToFindTrainings } from '../../../../../src/devcomp/domain/errors.js';
import { UserRecommendedTraining } from '../../../../../src/devcomp/domain/read-models/UserRecommendedTraining.js';
import { findCampaignParticipationTrainings } from '../../../../../src/devcomp/domain/usecases/find-campaign-participation-trainings.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | UseCases | find-campaign-participation-trainings', function () {
  let campaignParticipationRepository;
  let userRecommendedTrainingRepository;
  let campaignFeatureRepository;

  beforeEach(function () {
    campaignParticipationRepository = { get: sinon.stub() };
    userRecommendedTrainingRepository = { findByCampaignParticipationId: sinon.stub() };
    campaignFeatureRepository = { getHighlightedTrainingsForCampaign: sinon.stub() };
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
        campaignFeatureRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToFindTrainings);
    });
  });

  context('when authenticated user is the campaign participation owner', function () {
    it('should return trainings with isHighlighted set to true for highlighted trainings', async function () {
      // given
      const userId = 123;
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ userId });
      campaignParticipationRepository.get.resolves(campaignParticipation);
      const highlightedTraining = new UserRecommendedTraining({ id: 1 });
      const otherTraining = new UserRecommendedTraining({ id: 2 });
      userRecommendedTrainingRepository.findByCampaignParticipationId.resolves([highlightedTraining, otherTraining]);
      campaignFeatureRepository.getHighlightedTrainingsForCampaign.resolves([1]);

      // when
      const result = await findCampaignParticipationTrainings({
        userId,
        campaignParticipationId: campaignParticipation.id,
        locale: 'fr-fr',
        campaignParticipationRepository,
        userRecommendedTrainingRepository,
        campaignFeatureRepository,
      });

      // then
      expect(result.find((training) => training.id === 1).isHighlighted).to.equal(true);
      expect(result.find((training) => training.id === 2).isHighlighted).to.equal(false);
      expect(userRecommendedTrainingRepository.findByCampaignParticipationId).to.have.been.calledWithExactly({
        campaignParticipationId: campaignParticipation.id,
        locale: 'fr-fr',
      });
      expect(campaignFeatureRepository.getHighlightedTrainingsForCampaign).to.have.been.calledWithExactly({
        campaignId: campaignParticipation.campaignId,
      });
    });
  });
});
