const TABLE_NAME = 'certification-candidates';
const OLD_COLUMN_NAME = 'reconciliatedAt';
const NEW_COLUMN_NAME = 'reconciledAt';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME);
  });
};

export { down, up };
