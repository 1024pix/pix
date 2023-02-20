const TABLE_NAME = 'sessions';
const COLUMN_NAME_INCIDENT = 'hasIncident';
const COLUMN_NAME_JOINING_ISSUE = 'hasJoiningIssue';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME_INCIDENT).notNullable().defaultTo(false);
    table.boolean(COLUMN_NAME_JOINING_ISSUE).notNullable().defaultTo(false);
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME_INCIDENT);
    table.dropColumn(COLUMN_NAME_JOINING_ISSUE);
  });
};
