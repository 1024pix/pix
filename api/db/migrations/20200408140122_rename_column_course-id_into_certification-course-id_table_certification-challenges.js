const TABLE_NAME = 'certification-challenges';
const OLD_COLUMN_NAME = 'courseId';
const NEW_COLUMN_NAME = 'certificationCourseId';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME));
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME));
};
