const TABLE_NAME = 'certification-candidates';

export const up = async function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['sessionId', 'userId']);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['sessionId', 'userId']);
  });
};
