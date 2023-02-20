const TABLE_NAME = 'campaign-participations';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer('userId').unsigned().references('users.id').index();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('userId');
  });
};
