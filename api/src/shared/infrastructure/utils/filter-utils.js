import { knex } from '../../../../db/knex-database-connection.js';

const DEFAULT_DISTANCE = 0.8;

const filterByFullName = function (queryBuilder, search, firstName, lastName, distance = DEFAULT_DISTANCE) {
  const searchLowerCase = search.trim().toLowerCase();
  queryBuilder.where(function () {
    //the search is performed by pg_search which uses the distances between the pattern and the data
    //if the distance is too large then pg-search won't find anything
    //this is why the others where are used
    this.where(knex.raw(`CONCAT (??, ' ', ??) <-> ?`, [firstName, lastName, searchLowerCase]), '<=', distance);
    this.orWhereRaw('LOWER(??) LIKE ?', [firstName, `%${searchLowerCase}%`]);
    this.orWhereRaw('LOWER(??) LIKE ?', [lastName, `%${searchLowerCase}%`]);
  });
};

export { filterByFullName };
