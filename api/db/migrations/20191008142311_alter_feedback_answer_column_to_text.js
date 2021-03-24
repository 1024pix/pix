const TABLE_NAME = 'feedbacks';

exports.up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.text('answer').alter();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.string('answer').alter();
  });
};
