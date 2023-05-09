const TABLE_NAME = 'issue-report-categories';

const up = function (knex) {
  return knex(TABLE_NAME).update({ isDeprecated: true }).where('name', 'CONNECTION_OR_END_SCREEN');
};

const down = function (knex) {
  return knex(TABLE_NAME).update({ isDeprecated: false }).where('name', 'CONNECTION_OR_END_SCREEN');
};

export { up, down };
