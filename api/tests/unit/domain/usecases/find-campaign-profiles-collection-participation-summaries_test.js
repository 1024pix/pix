import { expect, sinon } from '../../../test-helper.js';
import { findCampaignProfilesCollectionParticipationSummaries } from '../../../../lib/domain/usecases/find-campaign-profiles-collection-participation-summaries.js';
import { CampaignProfilesCollectionParticipationSummary } from '../../../../lib/domain/read-models/CampaignProfilesCollectionParticipationSummary.js';

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

    campaignProfilesCollectionParticipationSummaryRepository = { findPaginatedByCampaignId: sinon.stub() };
    campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
  });

  it('should retrieve the campaign participations datas', async function () {
    const page = { number: 1 };
    const filters = { divisions: ['Barry White Classics'] };
    // given
    campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId
      .withArgs(campaignId, page, filters)
      .resolves(campaignProfilesCollectionParticipationSummaries);

    const participationSummaries = await findCampaignProfilesCollectionParticipationSummaries({
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
