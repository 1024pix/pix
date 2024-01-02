const TABLE_NAME = 'certification-issue-reports';
const COLUMN_NAME = 'liveAlertId';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).unsigned();
    table.foreign(COLUMN_NAME).references('certification-challenge-live-alerts.id');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
