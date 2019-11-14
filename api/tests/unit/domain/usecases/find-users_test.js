const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | find-users', () => {

  it('should result a SearchResultList object that take into account User search with filtering and pagination', async () => {
    // given
    const filters = {};
    const pagination = { page: 1, pageSize: 2 };
    const resolvedPagination = { page: 1, pageSize: 2, rowCount: 3, pageCount: 2 };
    const matchingUsers = [
      new User({ id: 1 }),
      new User({ id: 2 }),
      new User({ id: 3 }),
    ];
    const userRepository = {
      find: sinon.stub()
    };
    userRepository.find.withArgs(filters, pagination).resolves({ models: matchingUsers, pagination: resolvedPagination });

    // when
    const response = await usecases.findUsers({ filters, pagination, userRepository });

    // then
    expect(response.models).to.equal(matchingUsers);
    expect(response.pagination.page).to.equal(resolvedPagination.page);
    expect(response.pagination.pageSize).to.equal(resolvedPagination.pageSize);
    expect(response.pagination.itemsCount).to.equal(resolvedPagination.rowCount);
    expect(response.pagination.pagesCount).to.equal(resolvedPagination.pageCount);
  });
});
