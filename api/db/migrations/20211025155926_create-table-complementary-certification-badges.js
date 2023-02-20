export const up = async function (knex) {
  await knex.schema.createTable('complementary-certification-badges', (t) => {
    t.increments().primary();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.integer('complementaryCertificationId').references('complementary-certifications.id').notNullable();
    t.integer('badgeId').references('badges.id').notNullable();
  });

  const accreditationBadges = await knex.from('accredited-badges');
  const complementaryCertificationBadges = accreditationBadges.map(({ id, accreditationId, badgeId, createdAt }) => {
    return {
      id,
      complementaryCertificationId: accreditationId,
      badgeId,
      createdAt,
    };
  });

  if (complementaryCertificationBadges.length > 0) {
    await knex('complementary-certification-badges').insert(complementaryCertificationBadges);

    const maxIdResult = await knex('complementary-certification-badges').max('id').first();
    const idForNextInsertion = maxIdResult.max + 1;
    // eslint-disable-next-line knex/avoid-injections
    await knex.raw(`ALTER SEQUENCE "complementary-certification-badges_id_seq" RESTART WITH ${idForNextInsertion}`);
  }
};

export const down = function (knex) {
  return knex.schema.dropTable('complementary-certification-badges');
};
