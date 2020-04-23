const sessionValidator = require('../validators/session-validator');

module.exports = async function findPaginatedFilteredSessions({ filters, page, sessionRepository }) {
  try {
    sessionValidator.validateFilters(filters);
  } catch (err) {
    return {
      sessions: [],
      pagination: {
        page: page.number,
        pageSize: page.size,
        rowCount: 0, 
        pageCount: 0,
      },
    };
  }
  return sessionRepository.findPaginatedFiltered({ filters, page });
};
