import { expect, sinon } from '../../../test-helper';
import usecases from '../../../../lib/domain/usecases';
import Memberships from '../../../../lib/domain/models/Membership';

describe('Unit | UseCase | find-paginated-filtered-organizations-memberships', function () {
  it('should result organizations with filtering and pagination', async function () {
    // given
    const organizationId = 345;
    const filter = { firstName: 'André' };
    const page = { number: 1, size: 2 };

    const resolvedPagination = { page: 1, pageSize: 2, itemsCount: 3, pagesCount: 2 };
    const matchingMemberships = [new Memberships({ id: 1 }), new Memberships({ id: 2 }), new Memberships({ id: 3 })];
    const membershipRepository = {
      findPaginatedFiltered: sinon.stub(),
    };
    membershipRepository.findPaginatedFiltered
      .withArgs({ organizationId, filter, page })
      .resolves({ models: matchingMemberships, pagination: resolvedPagination });

    // when
    const response = await usecases.findPaginatedFilteredOrganizationMemberships({
      organizationId,
      filter,
      page,
      membershipRepository,
    });

    // then
    expect(response.models).to.equal(matchingMemberships);
    expect(response.pagination.page).to.equal(resolvedPagination.page);
    expect(response.pagination.pageSize).to.equal(resolvedPagination.pageSize);
    expect(response.pagination.itemsCount).to.equal(resolvedPagination.itemsCount);
    expect(response.pagination.pagesCount).to.equal(resolvedPagination.pagesCount);
  });
});
