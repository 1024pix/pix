const TABLE_NAME = 'knowledge-elements';
const ASSESSMENTID_COLUMN = 'assessmentId';
const OLD_INDEX_ASSESSMENTID = 'knowledge-elements_assessmentId_idx';

exports.up = async function(knex) {
  await knex.raw(`DROP INDEX IF EXISTS "${OLD_INDEX_ASSESSMENTID}"`);
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(ASSESSMENTID_COLUMN);
  });
};

exports.down = async function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(ASSESSMENTID_COLUMN);
    table.index(ASSESSMENTID_COLUMN, OLD_INDEX_ASSESSMENTID);
  });
};
