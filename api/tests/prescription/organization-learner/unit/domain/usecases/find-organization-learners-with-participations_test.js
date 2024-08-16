import { _getCampaignParticipationOverviewsWithoutPagination } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-organization-learners-with-participations.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | find-organization-learners-with-participations', function () {
  context('#_getCampaignParticipationOverviewsWithoutPagination', function () {
    it('should return all campaign participations', async function () {
      // given
      const userId = 1234;
      const campaignParticipationOverviewRepository = {
        findByUserIdWithFilters: sinon.stub(),
      };

      const campaignParticipationOverview1 = {
        id: 1234,
        userId,
      };
      const campaignParticipationOverview2 = {
        id: 1235,
        userId,
      };

      campaignParticipationOverviewRepository.findByUserIdWithFilters
        .withArgs({
          userId,
          page: { number: 1, size: 100 },
        })
        .resolves({
          campaignParticipationOverviews: [campaignParticipationOverview1],
          pagination: { pageSize: 100, pageCount: 2, rowCount: 110, page: 1 },
        });
      campaignParticipationOverviewRepository.findByUserIdWithFilters
        .withArgs({
          userId,
          page: { number: 2, size: 100 },
        })
        .resolves({
          campaignParticipationOverviews: [campaignParticipationOverview2],
          pagination: { pageSize: 100, pageCount: 2, rowCount: 110, page: 2 },
        });

      // when
      const campaignParticipationOverviews = await _getCampaignParticipationOverviewsWithoutPagination({
        userId,
        campaignParticipationOverviewRepository,
      });

      // then
      expect(campaignParticipationOverviews).to.be.deep.have.members([
        campaignParticipationOverview1,
        campaignParticipationOverview2,
      ]);
    });
  });
});
