const TABLE_NAME = 'assessments';
const COLUMN_NAME = 'certificationCourseId';
const REFERENCE = 'certification-courses.id';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).unsigned().references(REFERENCE).index();
  });
  return knex.raw(
    `
      UPDATE ??
      SET ?? = CAST(?? AS INTEGER)
      FROM ??
      WHERE ?? = CAST(?? AS VARCHAR) 
      AND ?? = ?
    `,
    [
      'assessments',
      'certificationCourseId',
      'courseId',
      'certification-courses',
      'assessments.courseId',
      'certification-courses.id',
      'assessments.type',
      'CERTIFICATION',
    ]
  );
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
