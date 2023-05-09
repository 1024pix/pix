const TABLE_NAME = 'assessments';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.bigInteger('userId').index().references('users.id');
    table.dropColumn('userName');
    table.dropColumn('userEmail');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('userId');
    table.string('userName').notNull();
    table.string('userEmail').notNull();
  });
};

export { up, down };
