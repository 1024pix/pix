const TABLE_NAME = 'assessments';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('missionId');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string('missionId').defaultTo(null);
  });
};

export { up, down };
