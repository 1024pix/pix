const TABLE_NAME = 'certification-centers';
const COLUMN_NAME = 'isScoBlockedAccessWhitelist';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .boolean(COLUMN_NAME)
      .defaultTo(false)
      .comment(
        'As of now, the center is currently eligible to SCO access closure when the property is set to false. Otherwise, the center is whitelisted (not closed)',
      );
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
