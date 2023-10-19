const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'cpfImportStatus';

const up = async function (knex) {
  await knex
    .with('outdated', (qb) => {
      qb.from(TABLE_NAME).select('id').where('createdAt', '<', '2021-07-01');
    })
    .update({ [COLUMN_NAME]: 'OUTDATED' })
    .from(TABLE_NAME)
    .whereExists(knex.select(1).from('outdated').whereRaw('"certification-courses"."id" = "outdated"."id"'));
};

const down = async function (knex) {
  return knex
    .update({ [COLUMN_NAME]: null })
    .from(TABLE_NAME)
    .where({ [COLUMN_NAME]: 'OUTDATED' });
};

export { up, down };
