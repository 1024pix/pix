import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors.js';
import { CampaignProfilesCollectionParticipationSummary } from '../../../../lib/domain/read-models/CampaignProfilesCollectionParticipationSummary.js';
import { findCampaignProfilesCollectionParticipationSummaries } from '../../../../lib/domain/usecases/find-campaign-profiles-collection-participation-summaries.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | find-campaign-profiles-collection-participation-summaries', function () {
  let userId, campaignId;
  let campaignRepository, campaignProfilesCollectionParticipationSummaryRepository;

  const campaignProfilesCollectionParticipationSummaries = [
    new CampaignProfilesCollectionParticipationSummary({
      campaignParticipationId: 1,
      firstName: 'Hello',
      lastName: 'World',
    }),
  ];

  beforeEach(function () {
    userId = Symbol('user id');
    campaignId = Symbol('campaign id');
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    campaignProfilesCollectionParticipationSummaryRepository = { findPaginatedByCampaignId: sinon.stub() };
  });

  context('the user belongs to the organization of the campaign', function () {
    let participationSummaries;

    beforeEach(async function () {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
    });

    it('should retrieve the campaign participations datas', async function () {
      const page = { number: 1 };
      const filters = { divisions: ['Barry White Classics'] };
      // given
      campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId
        .withArgs(campaignId, page, filters)
        .resolves(campaignProfilesCollectionParticipationSummaries);

      participationSummaries = await findCampaignProfilesCollectionParticipationSummaries({
        userId,
        campaignId,
        page,
        filters,
        campaignRepository,
        campaignProfilesCollectionParticipationSummaryRepository,
      });

      // then
      expect(participationSummaries).to.equal(campaignProfilesCollectionParticipationSummaries);
    });
  });

  context('the user does not belong to the organization of the campaign', function () {
    beforeEach(function () {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);
    });

    it('should throw a UserNotAuthorizedToAccessEntityError error', async function () {
      const requestErr = await catchErr(findCampaignProfilesCollectionParticipationSummaries)({
        userId,
        campaignId,
        campaignRepository,
        campaignProfilesCollectionParticipationSummaryRepository,
      });

      expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
