const TABLE_NAME = 'certification-issue-reports';

const up = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.integer('categoryId').references('issue-report-categories.id');
  });
};

const down = async function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('categoryId');
  });
};

export { up, down };
