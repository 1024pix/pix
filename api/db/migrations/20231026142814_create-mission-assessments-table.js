const TABLE_NAME = 'mission-assessments';

const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.integer('assessmentId').notNullable().unsigned().references('assessments.id').index();
    table.string('missionId').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = async function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
