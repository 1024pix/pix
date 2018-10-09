const { expect } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const SearchResultList = require('../../../../lib/domain/models/SearchResultList');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | find-users', () => {

  it('should result a SearchResultList object that take into account User search with filtering and pagination', () => {
    // given
    const filters = {};
    const pagination = { page: 1, pageSize: 10 };
    const matchingUsers = [
      new User({ id: 1 }),
      new User({ id: 2 }),
      new User({ id: 3 }),
    ];
    const userRepository = {
      find: () => matchingUsers,
      count: () => matchingUsers.length
    };

    // when
    const promise = usecases.findUsers({ filters, pagination, userRepository });

    // then
    return expect(promise).to.be.fulfilled.then((response) => {
      expect(response).to.be.an.instanceOf(SearchResultList);
      expect(response.page).to.equal(1);
      expect(response.pageSize).to.equal(10);
      expect(response.totalResults).to.equal(3);
      expect(response.paginatedResults).to.deep.equal(matchingUsers);
    });
  });
});
