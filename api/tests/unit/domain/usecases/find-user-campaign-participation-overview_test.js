const { sinon } = require('../../../test-helper');
const findUserCampaignParticipationOverviews = require('../../../../lib/domain/usecases/find-user-campaign-participation-overviews');

describe('Unit | UseCase | find-user--campaign-participation-overviews', () => {

  let campaignParticipationOverviewRepository;

  beforeEach(() => {
    campaignParticipationOverviewRepository = {
      findByUserIdWithFilters: sinon.stub(),
      findAllByUserId: sinon.stub(),
    };
  });

  context('when states is undefined', () => {
    it('should calls findAllByUserId', async () => {
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
      sinon.assert.calledWith(campaignParticipationOverviewRepository.findAllByUserId, userId);
    });
  });

  context('when states is ONGOING', () => {
    it('should calls findByUserIdWithFilters', async () => {
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
    it('should calls findByUserIdWithFilters', async () => {
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
