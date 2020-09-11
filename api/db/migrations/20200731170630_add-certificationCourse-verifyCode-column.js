const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'verificationCode';

exports.up = async function(knex) {
  await knex.schema.table(
    TABLE_NAME,
    (table) => {
      table.string(COLUMN_NAME);
    },
  );
  await knex.raw('CREATE UNIQUE INDEX index_certification_courses_upper_verification_code ON ?? (UPPER(??))', ['certification-courses', 'verificationCode']);
};

exports.down = async function(knex) {
  await knex.raw('DROP INDEX index_certification_courses_upper_verification_code');
  await knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
