const TABLE_NAME = 'target-profiles';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string('category').defaultTo('OTHER');
  });
  //does not work locally because the DB is empty during migration
  await knex(TABLE_NAME).where({ isPublic: true }).update({ category: 'COMPETENCES' });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('category');
  });
};
