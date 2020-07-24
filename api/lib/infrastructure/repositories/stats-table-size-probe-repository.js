const { knex, listAllPixTableNames } = require('../../../db/knex-database-connection');

const READ_TABLE_SIZES_QUERY = `
SELECT
  (pg_total_relation_size(?::regclass)/1024/1024)::integer AS total_size_mb,
  (pg_table_size(?::regclass)/1024/1024)::integer AS table_size_mb,
  (pg_indexes_size(?::regclass)/1024/1024)::integer AS indexes_size_mb
`;

module.exports = {

  async collect() {
    const pixTableNames = await listAllPixTableNames();

    const tableStats = [];
    for (const tableName of pixTableNames) {
      const { rows } = await knex.raw(READ_TABLE_SIZES_QUERY, [tableName, tableName, tableName]);
      tableStats.push(Object.assign({ 'table_name': tableName }, rows[0]));
    }

    return knex.batchInsert('stats_table_size_probes', tableStats);
  },
};
