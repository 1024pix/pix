const TABLE_NAME = 'pole-emploi-sendings';

exports.up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').primary();
    t.integer('campaignParticipationId').references('campaign-participations.id').index();
    t.string('type').notNullable();
    t.boolean('isSuccessful').notNullable();
    t.text('responseCode').notNullable();
    t.json('payload');
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
