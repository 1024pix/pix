const { sinon } = require('../../../test-helper');
const findUserCampaignParticipationOverviews = require('../../../../lib/domain/usecases/find-user-campaign-participation-overviews');

describe('Unit | UseCase | find-user--campaign-participation-overviews', () => {

  let campaignParticipationOverviewRepository;

  beforeEach(() => {
    campaignParticipationOverviewRepository = {
      findByUserIdWithFilters: sinon.stub(),
    };
  });

  context('when states is undefined', () => {
    it('should call findByUserIdWithFilters', async () => {
      // given
      const states = undefined;
      const userId = 1;

      // when
      findUserCampaignParticipationOverviews({
        userId,
        states,
        campaignParticipationOverviewRepository,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, { page: undefined, userId, states });
    });
  });

  context('when states is ONGOING', () => {
    it('should call findByUserIdWithFilters', async () => {
      // given
      const states = 'ONGOING';
      const userId = 1;
      const page = {};

      // when
      findUserCampaignParticipationOverviews({
        userId,
        states,
        campaignParticipationOverviewRepository,
        page,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, { page, userId, states: ['ONGOING'] });
    });
  });

  context('when states is [ONGOING]', () => {
    it('should call findByUserIdWithFilters', async () => {
      // given
      const states = ['ONGOING'];
      const userId = 1;
      const page = {};

      // when
      findUserCampaignParticipationOverviews({
        userId,
        states,
        campaignParticipationOverviewRepository,
        page,
      });

      // then
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findByUserIdWithFilters, { page, userId, states: ['ONGOING'] });
    });
  });
});
