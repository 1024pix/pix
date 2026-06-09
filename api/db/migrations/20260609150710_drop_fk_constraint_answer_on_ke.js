const TABLE_NAME = 'knowledge-elements';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropForeign('answerId');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.foreign('answerId').references('answers.id');
  });
};

export { down, up };
