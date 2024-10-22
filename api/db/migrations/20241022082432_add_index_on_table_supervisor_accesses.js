const TABLE_NAME = 'supervisor-accesses';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.index(['sessionId', 'userId']);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(['sessionId', 'userId']);
  });
};

export { down, up };
