const { expect, sinon, domainBuilder } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases/index.js');

describe('Unit | UseCase | find-paginated-filtered-target-profile-summaries-for-admin', function () {
  it('should return the result of the repository call', async function () {
    // given
    const targetProfileSummaryForAdminRepository = {
      findPaginatedFiltered: sinon.stub(),
    };
    const filter = { name: 'Dragon' };
    const page = { number: 1, size: 2 };
    const resolvedPagination = { page: 1, pageSize: 2, itemsCount: 3, pagesCount: 2 };
    const matchingTargetProfiles = [domainBuilder.buildTargetProfileSummaryForAdmin()];
    targetProfileSummaryForAdminRepository.findPaginatedFiltered
      .withArgs({ filter, page })
      .resolves({ models: matchingTargetProfiles, pagination: resolvedPagination });

    // when
    const response = await usecases.findPaginatedFilteredTargetProfileSummariesForAdmin({
      filter,
      page,
      targetProfileSummaryForAdminRepository,
    });

    // then
    expect(response).to.deep.equal({ models: matchingTargetProfiles, pagination: resolvedPagination });
  });
});
