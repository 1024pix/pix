const TABLE_NAME = 'certification-challenges';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('certifiableBadgeKey');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('certifiableBadgeKey');
  });
};
