import { expect, sinon, domainBuilder } from '../../../test-helper';
import findPaginatedParticipationsForCampaignManagement from '../../../../lib/domain/usecases/find-paginated-participations-for-campaign-management';

describe('Unit | UseCase | findPaginatedParticipationsForCampaignManagement', function () {
  const campaignId = 1;
  const page = { number: 1, size: 2 };
  const resolvedPagination = { page: 1, pageSize: 2, itemsCount: 3, pagesCount: 2 };
  let expectedParticipationsForCampaignManagement;

  beforeEach(function () {
    expectedParticipationsForCampaignManagement = [
      domainBuilder.buildParticipationForCampaignManagement(),
      domainBuilder.buildParticipationForCampaignManagement(),
      domainBuilder.buildParticipationForCampaignManagement(),
    ];
  });

  it('should fetch campaign participations matching campaign', async function () {
    const participationsForCampaignManagementRepository = {
      findPaginatedParticipationsForCampaignManagement: sinon.stub(),
    };
    participationsForCampaignManagementRepository.findPaginatedParticipationsForCampaignManagement
      .withArgs({ campaignId, page })
      .resolves({ models: expectedParticipationsForCampaignManagement, pagination: resolvedPagination });

    const { models: foundParticipationsForCampaignManagement } = await findPaginatedParticipationsForCampaignManagement(
      {
        campaignId,
        page,
        participationsForCampaignManagementRepository,
      }
    );

    expect(foundParticipationsForCampaignManagement).to.deep.equal(expectedParticipationsForCampaignManagement);
  });

  it('should return pagination', async function () {
    const participationsForCampaignManagementRepository = {
      findPaginatedParticipationsForCampaignManagement: sinon.stub(),
    };
    participationsForCampaignManagementRepository.findPaginatedParticipationsForCampaignManagement
      .withArgs({ campaignId, page })
      .resolves({ models: expectedParticipationsForCampaignManagement, pagination: resolvedPagination });

    const { pagination } = await findPaginatedParticipationsForCampaignManagement({
      campaignId,
      page,
      participationsForCampaignManagementRepository,
    });

    expect(pagination).to.deep.equal(resolvedPagination);
  });
});
