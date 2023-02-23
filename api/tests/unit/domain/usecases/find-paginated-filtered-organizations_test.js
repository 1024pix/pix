const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases/index.js');
const Organization = require('../../../../lib/domain/models/Organization');

describe('Unit | UseCase | find-paginated-filtered-organizations', function () {
  it('should result organizations with filtering and pagination', async function () {
    // given
    const filter = { name: 'Dragon' };
    const page = { number: 1, size: 2 };

    const resolvedPagination = { page: 1, pageSize: 2, itemsCount: 3, pagesCount: 2 };
    const matchingOrganizations = [
      new Organization({ id: 1 }),
      new Organization({ id: 2 }),
      new Organization({ id: 3 }),
    ];
    const organizationRepository = {
      findPaginatedFiltered: sinon.stub(),
    };
    organizationRepository.findPaginatedFiltered
      .withArgs({ filter, page })
      .resolves({ models: matchingOrganizations, pagination: resolvedPagination });

    // when
    const response = await usecases.findPaginatedFilteredOrganizations({ filter, page, organizationRepository });

    // then
    expect(response.models).to.equal(matchingOrganizations);
    expect(response.pagination.page).to.equal(resolvedPagination.page);
    expect(response.pagination.pageSize).to.equal(resolvedPagination.pageSize);
    expect(response.pagination.itemsCount).to.equal(resolvedPagination.itemsCount);
    expect(response.pagination.pagesCount).to.equal(resolvedPagination.pagesCount);
  });
});
