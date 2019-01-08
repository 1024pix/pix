const { expect } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const SearchResultList = require('../../../../lib/domain/models/SearchResultList');
const Organization = require('../../../../lib/domain/models/Organization');

describe('Unit | UseCase | find-organizations', () => {

  it('should result a SearchResultList object that take into account Organization search with filtering and pagination', () => {
    // given
    const filters = {};
    const pagination = { page: 1, pageSize: 10 };
    const matchingOrganizations = [
      new Organization({ id: 1 }),
      new Organization({ id: 2 }),
      new Organization({ id: 3 }),
    ];
    const organizationRepository = {
      find: () => matchingOrganizations,
      count: () => matchingOrganizations.length
    };

    // when
    const promise = usecases.findOrganizations({ filters, pagination, organizationRepository });

    // then
    return expect(promise).to.be.fulfilled.then((response) => {
      expect(response).to.be.an.instanceOf(SearchResultList);
      expect(response.page).to.equal(1);
      expect(response.pageSize).to.equal(10);
      expect(response.totalResults).to.equal(3);
      expect(response.paginatedResults).to.deep.equal(matchingOrganizations);
    });
  });
});
