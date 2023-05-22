const TABLE_NAME = 'assessment-results';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.integer('level');
    t.integer('pixScore').unsigned();
    t.text('emitter').notNull();
    t.text('commentForJury');
    t.text('commentForOrganization');
    t.text('commentForCandidate');
    t.text('status').notNull();
    t.integer('juryId').unsigned().references('users.id');
    t.integer('assessmentId').unsigned().references('assessments.id');
    t.index('assessmentId');
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
