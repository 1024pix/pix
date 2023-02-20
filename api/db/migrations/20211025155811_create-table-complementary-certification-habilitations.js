export const up = async function (knex) {
  await knex.schema.createTable('complementary-certification-habilitations', (t) => {
    t.increments().primary();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.integer('complementaryCertificationId').references('complementary-certifications.id').notNullable();
    t.integer('certificationCenterId').references('certification-centers.id').notNullable();
  });

  const grantedAccreditations = await knex.from('granted-accreditations');
  const complementaryCertificationHabilitations = grantedAccreditations.map(
    ({ id, accreditationId, certificationCenterId, createdAt }) => {
      return {
        id,
        complementaryCertificationId: accreditationId,
        certificationCenterId,
        createdAt,
      };
    }
  );

  if (complementaryCertificationHabilitations.length > 0) {
    await knex('complementary-certification-habilitations').insert(complementaryCertificationHabilitations);

    const maxIdResult = await knex('complementary-certification-habilitations').max('id').first();
    const idForNextInsertion = maxIdResult.max + 1;
    // eslint-disable-next-line knex/avoid-injections
    await knex.raw(
      `ALTER SEQUENCE "complementary-certification-habilitations_id_seq" RESTART WITH ${idForNextInsertion}`
    );
  }
};

export const down = function (knex) {
  return knex.schema.dropTable('complementary-certification-habilitations');
};
