const TABLE_NAME = 'certification-candidates';

const up = async function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['sessionId', 'userId']);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['sessionId', 'userId']);
  });
};

export { up, down };
