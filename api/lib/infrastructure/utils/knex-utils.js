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
    },
  };
};

function isUniqConstraintViolated(err) {
  const PGSQL_UNIQ_CONSTRAINT = '23505';

  return err.code === PGSQL_UNIQ_CONSTRAINT;
}

function foreignKeyConstraintViolated(err) {
  const PGSQL_FK_CONSTRAINT = '23503';

  return err.code === PGSQL_FK_CONSTRAINT;
}

function getChunkSizeForParameterBinding(objectAboutToBeBinded) {
  // PostgreSQL allows a maximum of 65536 binded parameters in prepared statements
  const MAX_BINDED_PARAMS_PG = 65536;
  if (objectAboutToBeBinded) {
    return Math.floor(MAX_BINDED_PARAMS_PG / Object.keys(objectAboutToBeBinded).length);
  }
  return MAX_BINDED_PARAMS_PG;
}

module.exports = {
  fetchPage,
  isUniqConstraintViolated,
  foreignKeyConstraintViolated,
  getChunkSizeForParameterBinding,
};
