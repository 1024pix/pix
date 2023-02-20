const TABLE_NAME = 'feedbacks';

export const up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.text('answer').alter();
  });
};

export const down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string('answer').alter();
  });
};
