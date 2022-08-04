const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');
const findCampaignParticipationTrainings = require('../../../../lib/domain/usecases/find-campaign-participation-trainings.js');
const { UserNotAuthorizedToFindTrainings } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-campaign-participation-trainings', function () {
  let campaignRepository;
  let campaignParticipationRepository;
  let trainingRepository;

  beforeEach(function () {
    campaignRepository = { get: sinon.stub() };
    campaignParticipationRepository = { get: sinon.stub() };
    trainingRepository = { findByTargetProfileIdAndLocale: sinon.stub() };
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
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToFindTrainings);
    });
  });

  context('when related campaign is not associated to targetProfile', function () {
    it('should return empty array', async function () {
      // given
      const userId = 123;
      const campaignWithoutTargetProfileId = domainBuilder.buildCampaign({ targetProfile: null });
      const campaignParticipation = domainBuilder.buildCampaignParticipation({
        userId,
        campaign: campaignWithoutTargetProfileId,
      });
      campaignRepository.get.resolves(campaignParticipation.campaign);
      campaignParticipationRepository.get.resolves(campaignParticipation);

      // when
      const result = await findCampaignParticipationTrainings({
        userId,
        campaignParticipationId: campaignParticipation.id,
        campaignRepository,
        campaignParticipationRepository,
      });

      // then
      expect(result).to.deep.equal([]);
    });
  });

  context('when related campaign is associated with a targetProfile', function () {
    it('should return array of trainings', async function () {
      // given
      const userId = 123;
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ userId });
      campaignRepository.get.resolves(campaignParticipation.campaign);
      campaignParticipationRepository.get.resolves(campaignParticipation);

      const trainings = Symbol('trainings');

      trainingRepository.findByTargetProfileIdAndLocale.resolves(trainings);

      // when
      const result = await findCampaignParticipationTrainings({
        userId,
        campaignParticipationId: campaignParticipation.id,
        locale: 'fr-fr',
        campaignRepository,
        campaignParticipationRepository,
        trainingRepository,
      });

      // then
      expect(result).to.deep.equal(trainings);
    });
  });
});
