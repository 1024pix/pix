const TABLE_NAME = 'knowledge-elements';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer('userId').references('users.id').index();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('userId');
  });
};
