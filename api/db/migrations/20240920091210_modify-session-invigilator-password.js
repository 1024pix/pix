const TABLE_NAME = 'sessions';
const OLD_COLUMN_NAME = 'supervisorPassword';
const NEW_COLUMN_NAME = 'invigilatorPassword';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME);
  });

  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string(NEW_COLUMN_NAME, 6).alter();
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME);
  });

  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string(OLD_COLUMN_NAME, 5).alter();
  });
};

export { down, up };
