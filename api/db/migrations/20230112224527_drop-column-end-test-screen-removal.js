const TABLE_NAME = 'certification-centers';
const COLUMN_NAME = 'isSupervisorAccessEnabled';

exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

exports.down = async function () {
  // do nothing.
};
