const TABLE_NAME = 'issue-report-categories';

exports.up = function (knex) {
  return knex(TABLE_NAME).update({ isDeprecated: true }).where('name', 'CONNECTION_OR_END_SCREEN');
};

exports.down = function (knex) {
  return knex(TABLE_NAME).update({ isDeprecated: false }).where('name', 'CONNECTION_OR_END_SCREEN');
};
