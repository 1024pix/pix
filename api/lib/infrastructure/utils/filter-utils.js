const { knex } = require('../../../db/knex-database-connection');

const DISTANCE = 0.8;
module.exports = {
  filterByFullName(queryBuilder, search, firstName, lastName) {
    const searchLowerCase = search.trim().toLowerCase();
    queryBuilder.where(function () {
      this.where(knex.raw(`CONCAT (??, ' ', ??) <-> ?`, [firstName, lastName, searchLowerCase]), '<=', DISTANCE);
      this.orWhereRaw('LOWER(??) LIKE ?', [firstName, `%${searchLowerCase}%`]);
      this.orWhereRaw('LOWER(??) LIKE ?', [lastName, `%${searchLowerCase}%`]);
    });
  },
};
