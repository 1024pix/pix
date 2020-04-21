const _ = require('lodash');
const sessionValidator = require('../validators/session-validator');

module.exports = async function findPaginatedFilteredSessions({ filters, page, jurySessionRepository }) {
  let normalizedFilters;
  try {
    const trimmedFilters = _.mapValues(filters, (value) => {
      if (typeof value === 'string') {
        return value.trim() || undefined;
      }
      return value;
    });
    normalizedFilters = sessionValidator.validateFilters(trimmedFilters);
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
  return jurySessionRepository.findPaginatedFiltered({ filters: normalizedFilters, page });
};
