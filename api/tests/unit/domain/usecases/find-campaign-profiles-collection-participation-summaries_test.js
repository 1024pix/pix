import { expect, sinon, catchErr } from '../../../test-helper';
import findCampaignProfilesCollectionParticipationSummaries from '../../../../lib/domain/usecases/find-campaign-profiles-collection-participation-summaries';
import CampaignProfilesCollectionParticipationSummary from '../../../../lib/domain/read-models/CampaignProfilesCollectionParticipationSummary';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | find-campaign-profiles-collection-participation-summaries', function () {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const userId = Symbol('user id');
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const campaignId = Symbol('campaign id');
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const campaignProfilesCollectionParticipationSummaryRepository = { findPaginatedByCampaignId: sinon.stub() };

  const campaignProfilesCollectionParticipationSummaries = [
    new CampaignProfilesCollectionParticipationSummary({
      campaignParticipationId: 1,
      firstName: 'Hello',
      lastName: 'World',
    }),
  ];

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
