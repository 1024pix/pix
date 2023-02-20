import { knex } from '../../../db/knex-database-connection';

const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
};

/**
 * Paginate a knex query with given page parameters
 * @param {*} queryBuilder - a knex query builder
 * @param {Object} page - page parameters
 * @param {Number} page.number - the page number to retrieve
 * @param {Number} page.size - the size of the page
 */
const fetchPage = async (
  queryBuilder,
  { number = DEFAULT_PAGINATION.PAGE, size = DEFAULT_PAGINATION.PAGE_SIZE } = {}
) => {
  const page = number < 1 ? 1 : number;
  const offset = (page - 1) * size;

  const clone = queryBuilder.clone();
  // we cannot execute the query and count the total rows at the same time
  // because it would not work when there are DISTINCT selection in the SELECT clause
  const { rowCount } = await knex.count('*', { as: 'rowCount' }).from(clone.as('query_all_results')).first();
  const results = await queryBuilder.limit(size).offset(offset);

  return {
    results,
    pagination: {
      page,
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

export default {
  fetchPage,
  isUniqConstraintViolated,
  foreignKeyConstraintViolated,
  getChunkSizeForParameterBinding,
  DEFAULT_PAGINATION,
};
