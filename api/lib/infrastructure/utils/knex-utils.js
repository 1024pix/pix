const { knex } = require('../bookshelf');

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

/**
 * Paginate a knex query with given page parameters
 * @param {*} queryBuilder - a knex query builder
 * @param {Object} page - page parameters 
 * @param {Number} page.number - the page number to retrieve 
 * @param {Number} page.size - the size of the page
 */
const fetchPage = async (queryBuilder, { number = DEFAULT_PAGE, size = DEFAULT_PAGE_SIZE } = {}) => {
  const offset = (number - 1) * size;

  const results = await queryBuilder
    .select(knex.raw('COUNT(*) OVER() AS ??', ['rowCount']))
    .limit(size).offset(offset);

  const rowCount = results.length ? results[0].rowCount : 0;

  return { 
    results,
    pagination: {
      page: number,
      pageSize: size,
      rowCount,
      pageCount: Math.ceil(rowCount / size),
    }
  };
};

module.exports = { 
  fetchPage,
};
