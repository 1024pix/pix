const { knex } = require('../../../db/knex-database-connection');
const { fetchPage } = require('../utils/knex-utils');
const TargetProfileSummaryForAdmin = require('../../domain/models/TargetProfileSummaryForAdmin');

module.exports = {
  async findPaginatedFiltered({ filter, page }) {
    const query = knex('target-profiles')
      .select('id', 'name', 'outdated')
      .orderBy('id', 'ASC')
      .modify(_applyFilters, filter);

    const { results, pagination } = await fetchPage(query, page);

    const targetProfileSummaries = results.map((attributes) => new TargetProfileSummaryForAdmin(attributes));
    return { models: targetProfileSummaries, meta: { ...pagination } };
  },
};

function _applyFilters(qb, filter) {
  const { name, id } = filter;
  if (name) {
    qb.whereRaw('LOWER("name") LIKE ?', `%${name.toLowerCase()}%`);
  }
  if (id) {
    qb.where({ id });
  }
  return qb;
}
