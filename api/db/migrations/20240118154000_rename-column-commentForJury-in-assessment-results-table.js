const up = async function (knex) {
  await knex.schema.table('assessment-results', function (table) {
    table.renameColumn('commentForJury', 'commentByJury');
  });
};

const down = async function (knex) {
  await knex.schema.table('assessment-results', function (table) {
    table.renameColumn('commentByJury', 'commentForJury');
  });
};

export { up, down };
