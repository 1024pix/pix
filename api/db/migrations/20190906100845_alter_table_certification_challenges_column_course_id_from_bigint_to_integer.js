const TABLE_NAME = 'certification-challenges';

exports.up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.integer('courseId').unsigned().alter();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.bigInteger('courseId').unsigned().alter();
  });
};
