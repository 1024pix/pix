const { sinon, domainBuilder } = require('../../../test-helper');
const findUserCampaignParticipationOverviews = require('../../../../lib/domain/usecases/find-user-campaign-participation-overviews');
describe('Unit | UseCase | find-user-campaign-participation-overviews', function() {

  let campaignParticipationOverviewRepository;
  let targetProfileWithLearningContentRepository;

  beforeEach(function() {
    campaignParticipationOverviewRepository = {
      findByUserIdWithFilters: sinon.stub().resolves({
        campaignParticipationOverviews: [],
        pagination: {},
      }),
    };
    targetProfileWithLearningContentRepository = {
      get: sinon.stub().resolves(domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent()),
    };
  });

  context('when states is undefined', function() {
    it('should call findByUserIdWithFilters', async function() {
      // given
      const states = undefined;
      const userId = 1;

      // when
      await findUserCampaignParticipationOverviews({
        userId,
        states,
        campaignParticipationOverviewRepository,
        targetProfileWithLearningContentRepository,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, { page: undefined, userId, states });
    });
  });

  context('when states is a string', function() {
    it('should call findByUserIdWithFilters with an array of states', async function() {
      // given
      const states = 'ONGOING';
      const userId = 1;
      const page = {};

      // when
      await findUserCampaignParticipationOverviews({
        userId,
        states,
        campaignParticipationOverviewRepository,
        targetProfileWithLearningContentRepository,
        page,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, {
        page,
        userId,
        states: ['ONGOING'],
      });
    });
  });

  context('when states is an array', function() {
    it('should call findByUserIdWithFilters with an array of states', async function() {
      // given
      const states = ['ONGOING'];
      const userId = 1;
      const page = {};

      // when
      await findUserCampaignParticipationOverviews({
        userId,
        states,
        campaignParticipationOverviewRepository,
        targetProfileWithLearningContentRepository,
        page,
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
