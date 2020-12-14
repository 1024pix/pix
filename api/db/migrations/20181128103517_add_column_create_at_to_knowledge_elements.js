const TABLE_NAME = 'knowledge-elements';

exports.up = async (knex) => {

  const info = await knex(TABLE_NAME).columnInfo();
  if (!info.createdAt) {
    return knex.schema.table(TABLE_NAME, (table) => table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now()))
      .then(() => knex.raw('update "knowledge-elements" set "createdAt" = (select "createdAt" from answers where "knowledge-elements"."answerId" = answers.id);'));
  }

};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('createdAt');
  });
};
