export const up = async function (knex) {
  await knex.schema.createTable('complementary-certifications', (t) => {
    t.increments().primary();
    t.string('name').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });

  const accreditations = await knex.from('accreditations');

  if (accreditations.length > 0) {
    await knex('complementary-certifications').insert(accreditations);

    const maxIdResult = await knex('complementary-certifications').max('id').first();
    const idForNextInsertion = maxIdResult.max + 1;
    // eslint-disable-next-line knex/avoid-injections
    await knex.raw(`ALTER SEQUENCE "complementary-certifications_id_seq" RESTART WITH ${idForNextInsertion}`);
  }
};

export const down = function (knex) {
  return knex.schema.dropTable('complementary-certifications');
};
