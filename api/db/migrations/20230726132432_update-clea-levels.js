const TABLE_NAME = 'complementary-certification-badges';

const up = async function (knex) {
  const { id: complementaryCertificationId } = await knex('complementary-certifications')
    .select('id')
    .where({ key: 'CLEA' })
    .first();

  await knex(TABLE_NAME)
    .update({ detachedAt: knex.fn.now() })
    .where({ complementaryCertificationId })
    .whereNot({ level: knex(TABLE_NAME).max('level').where({ complementaryCertificationId }) });

  await knex(TABLE_NAME).update({ level: 1 }).where({ complementaryCertificationId });
};

// eslint-disable-next-line no-empty-function
const down = async () => {};

export { down, up };
