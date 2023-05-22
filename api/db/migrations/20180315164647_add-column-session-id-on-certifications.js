const TABLE_NAME = 'certification-courses';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer('sessionId').references('sessions.id').index();
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer('sessionId').references('sessions.id').index();
  });
};

export { up, down };
