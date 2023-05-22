const TABLE_NAME = 'certification-challenges';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('certifiableBadgeKey');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('certifiableBadgeKey');
  });
};

export { up, down };
