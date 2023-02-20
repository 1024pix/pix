const TABLE_NAME = 'autojury-script-audit';

export const up = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export const down = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('sessionId').primary();
    t.text('certificationCenterName');
    t.dateTime('finalizedAt');
    t.date('sessionDate');
    t.time('sessionTime');
    t.boolean('hasExaminerGlobalComment', 500);
    t.string('error', 1000);
    t.enu('status', ['TO DO', 'DOING', 'DONE', 'TO RETRY']);
  });
};
