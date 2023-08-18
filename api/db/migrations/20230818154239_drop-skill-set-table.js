const up = async function (knex) {
  await knex.schema.dropTable('skill-sets');
  // clean corrupted data in prod, there are some criteria with mispelled scope
  await knex('badge-criteria').whereRaw('LOWER(??) = ?', ['scope', 'skillset']).delete();
  return knex.schema.table('badge-criteria', function (table) {
    table.dropColumn('skillSetIds');
  });
};

const down = async function () {
  // No down script will be written since all data is lost anyway,
  // and at this point in GitHub table is not read anymore by the code
};

export { up, down };
