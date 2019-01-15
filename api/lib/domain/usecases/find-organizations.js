const SearchResultList = require('../models/SearchResultList');

module.exports = function findOrganizations({ filters, pagination, organizationRepository }) {

  return Promise.all([
    organizationRepository.find(filters, pagination),
    organizationRepository.count(filters)
  ]).then(([paginatedResults, totalResults]) => {

    return new SearchResultList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalResults,
      paginatedResults
    });
  });
};
