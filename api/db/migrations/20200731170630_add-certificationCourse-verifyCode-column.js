const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'verificationCode';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME);
  });
  await knex.raw('CREATE UNIQUE INDEX index_certification_courses_upper_verification_code ON ?? (UPPER(??))', [
    'certification-courses',
    'verificationCode',
  ]);
};

export const down = async function (knex) {
  await knex.raw('DROP INDEX index_certification_courses_upper_verification_code');
  await knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
