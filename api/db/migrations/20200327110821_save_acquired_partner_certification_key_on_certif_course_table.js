const TABLE_NAME = 'certification-partner-acquisitions';
const REF_CERTIF_COURSE_TABLE_NAME = 'certification-courses';
const REF_BADGE_TABLE_NAME = 'badges';
const COLUMN_KEY = 'partnerKey';

exports.up = async (knex) => {

  return knex.schema.createTable(TABLE_NAME, (table) => {
    table
      .integer('certificationCourseId')
      .references(`${REF_CERTIF_COURSE_TABLE_NAME}.id`)
      .notNullable()
      .index();
    table
      .string(COLUMN_KEY)
      .references(`${REF_BADGE_TABLE_NAME}.key`)
      .notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
