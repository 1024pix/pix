const TABLE_NAME = 'target-profiles';
const COLUMN = 'migration_status';

const up = async function(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN).default('N/A').notNullable();
  });
  await knex(TABLE_NAME)
    .update(COLUMN, 'NOT_MIGRATED')
    .whereNotIn('id', function () {
      this.select('targetProfileId').from('target-profile_tubes');
    });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN);
  });
};

export { up, down };
