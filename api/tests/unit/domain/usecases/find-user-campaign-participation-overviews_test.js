import { sinon } from '../../../test-helper.js';
import { findUserCampaignParticipationOverviews } from '../../../../lib/domain/usecases/find-user-campaign-participation-overviews.js';
describe('Unit | UseCase | find-user-campaign-participation-overviews', function () {
  let compareStagesAndAcquiredStagesService,
    campaignParticipationOverviewRepository,
    stageRepository,
    stageAcquisitionRepository;

  beforeEach(function () {
    compareStagesAndAcquiredStagesService = {
      compare: sinon.stub().returns([]),
    };
    campaignParticipationOverviewRepository = {
      findByUserIdWithFilters: sinon.stub().resolves({
        campaignParticipationOverviews: [],
        pagination: {},
      }),
    };
    stageRepository = { getByCampaignIds: sinon.stub().resolves([]) };
    stageAcquisitionRepository = { getByCampaignParticipations: sinon.stub().resolves([]) };
  });

  context('when states is undefined', function () {
    it('should call findByUserIdWithFilters', async function () {
      // given
      const states = undefined;
      const userId = 1;

      // when
      await findUserCampaignParticipationOverviews({
        userId,
        states,
        compareStagesAndAcquiredStagesService,
        campaignParticipationOverviewRepository,
        stageRepository,
        stageAcquisitionRepository,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, {
        page: undefined,
        userId,
        states,
      });
    });
  });

  context('when states is a string', function () {
    it('should call findByUserIdWithFilters with an array of states', async function () {
      // given
      const states = 'ONGOING';
      const userId = 1;
      const page = {};

      // when
      await findUserCampaignParticipationOverviews({
        userId,
        states,
        page,
        compareStagesAndAcquiredStagesService,
        campaignParticipationOverviewRepository,
        stageRepository,
        stageAcquisitionRepository,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, {
        page,
        userId,
        states: ['ONGOING'],
      });
    });
  });

  context('when states is an array', function () {
    it('should call findByUserIdWithFilters with an array of states', async function () {
      // given
      const states = ['ONGOING'];
      const userId = 1;
      const page = {};

      // when
      await findUserCampaignParticipationOverviews({
        userId,
        states,
        page,
        compareStagesAndAcquiredStagesService,
        campaignParticipationOverviewRepository,
        stageRepository,
        stageAcquisitionRepository,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, {
        page,
        userId,
        states: ['ONGOING'],
      });
    });
  });
});
