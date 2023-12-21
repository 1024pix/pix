import { expect, sinon } from '../../../../../test-helper.js';
import { findCampaignProfilesCollectionParticipationSummaries } from '../../../../../../src/prescription/campaign/domain/usecases/find-campaign-profiles-collection-participation-summaries.js';
import { CampaignProfilesCollectionParticipationSummary } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignProfilesCollectionParticipationSummary.js';

describe('Unit | UseCase | find-campaign-profiles-collection-participation-summaries', function () {
  let campaignId;
  let campaignRepository, campaignProfilesCollectionParticipationSummaryRepository;

  const campaignProfilesCollectionParticipationSummaries = [
    new CampaignProfilesCollectionParticipationSummary({
      campaignParticipationId: 1,
      firstName: 'Hello',
      lastName: 'World',
    }),
  ];

  beforeEach(function () {
    campaignId = Symbol('campaign id');

    campaignProfilesCollectionParticipationSummaryRepository = { findPaginatedByCampaignId: sinon.stub() };
  });

  it('should retrieve the campaign participations datas', async function () {
    const page = { number: 1 };
    const filters = { divisions: ['Barry White Classics'] };
    // given
    campaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId
      .withArgs(campaignId, page, filters)
      .resolves(campaignProfilesCollectionParticipationSummaries);

    const participationSummaries = await findCampaignProfilesCollectionParticipationSummaries({
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
