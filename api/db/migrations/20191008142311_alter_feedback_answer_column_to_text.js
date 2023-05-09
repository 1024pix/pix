const TABLE_NAME = 'feedbacks';

const up = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.text('answer').alter();
  });
};

const down = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string('answer').alter();
  });
};

export { up, down };
