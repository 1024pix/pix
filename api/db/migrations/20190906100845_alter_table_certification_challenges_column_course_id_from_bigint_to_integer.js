const TABLE_NAME = 'certification-challenges';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('courseId').unsigned().alter();
  });
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.bigInteger('courseId').unsigned().alter();
  });
};

export { up, down };
