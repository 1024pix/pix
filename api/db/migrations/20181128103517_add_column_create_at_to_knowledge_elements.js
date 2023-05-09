const TABLE_NAME = 'knowledge-elements';

const up = async function (knex) {
  const info = await knex(TABLE_NAME).columnInfo();
  if (!info.createdAt) {
    return knex.schema
      .table(TABLE_NAME, (table) => table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now()))
      .then(() =>
        knex.raw(
          'update "knowledge-elements" set "createdAt" = (select "createdAt" from answers where "knowledge-elements"."answerId" = answers.id);'
        )
      );
  }
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('createdAt');
  });
};

export { up, down };
