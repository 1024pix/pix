const TABLE_NAME = 'campaign-participations';

exports.up = (knex) => {
  return knex.schema
    .createTable(TABLE_NAME, (t) => {
      t.increments().primary();
      t.integer('campaignId').unsigned().references('campaigns.id').index();
      t.integer('assessmentId').unsigned().references('assessments.id').index();
      t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTable(TABLE_NAME);
};
