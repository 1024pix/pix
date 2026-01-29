import { knex } from '../../../../db/knex-database-connection.js';
// TODO LAURA check me again later
const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
};

/**
 * Paginate a knex query with given page parameters
 * @param {object} params
 * @param {object} params.queryBuilder - a knex query builder
 * @param {object} params.paginationParams
 * @param {Number} params.paginationParams.number - the page number to retrieve
 * @param {Number} params.paginationParams.size - the size of the page
 * @param {object|null} params.trx - transaction to use
 * @param {object|null} params.countQueryBuilder - a knex query builder that counts the total number of rows, bypassing the default one
 */
const fetchPage = async ({
  queryBuilder,
  paginationParams: { number = DEFAULT_PAGINATION.PAGE, size = DEFAULT_PAGINATION.PAGE_SIZE } = {},
  trx = null,
  countQueryBuilder = null,
}) => {
  const page = number < 1 ? 1 : number;
  const offset = (page - 1) * size;

  const defaultCountQueryBuilder = knex
    .count('*', { as: 'row_count' })
    .from(queryBuilder.clone().as('query_all_results'));
  const finalCountQueryBuilder = countQueryBuilder || defaultCountQueryBuilder;

  // we cannot execute the query and count the total rows at the same time
  // because it would not work when there are DISTINCT selection in the SELECT clause
  let results, rowCount;
  if (trx) {
    results = await queryBuilder.limit(size).offset(offset).transacting(trx);
    const { row_count } = await finalCountQueryBuilder.transacting(trx).first();
    rowCount = row_count;
  } else {
    results = await queryBuilder.limit(size).offset(offset);
    const { row_count } = await finalCountQueryBuilder.first();
    rowCount = row_count;
  }

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

export { DEFAULT_PAGINATION, fetchPage, foreignKeyConstraintViolated, isUniqConstraintViolated };
