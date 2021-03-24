const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');

describe('Unit | UseCase | find-paginated-filtered-target-profiles', function() {

  it('should result target profiles with filtering and pagination', async function() {
    // given
    const filter = { name: 'Dragon' };
    const page = { number: 1, size: 2 };

    const resolvedPagination = { page: 1, pageSize: 2, itemsCount: 3, pagesCount: 2 };
    const matchingTargetProfiles = [
      new TargetProfile({ id: 1 }),
      new TargetProfile({ id: 2 }),
      new TargetProfile({ id: 3 }),
    ];
    const targetProfileRepository = {
      findPaginatedFiltered: sinon.stub(),
    };
    targetProfileRepository.findPaginatedFiltered.withArgs({ filter, page }).resolves({ models: matchingTargetProfiles, pagination: resolvedPagination });

    // when
    const response = await usecases.findPaginatedFilteredTargetProfiles({ filter, page, targetProfileRepository });

    // then
    expect(response.models).to.equal(matchingTargetProfiles);
    expect(response.pagination.page).to.equal(resolvedPagination.page);
    expect(response.pagination.pageSize).to.equal(resolvedPagination.pageSize);
    expect(response.pagination.itemsCount).to.equal(resolvedPagination.itemsCount);
    expect(response.pagination.pagesCount).to.equal(resolvedPagination.pagesCount);
  });
});
