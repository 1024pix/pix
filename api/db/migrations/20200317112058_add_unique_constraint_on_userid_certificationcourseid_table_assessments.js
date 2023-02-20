const TABLE_NAME = 'assessments';
const COLUMN_USER_ID = 'userId';
const COLUMN_CERTIFICATION_COURSE_ID = 'certificationCourseId';

export const up = async (knex) => {
  await knex.raw(`
    WITH ASSESSMENTS_BY_CERTIFICATION_COURSES AS (
      SELECT "as"."id" as assessment_id,
        COUNT("as"."id") OVER (PARTITION BY "as"."certificationCourseId") AS cnt_assessments_per_certification_course,
        ROW_NUMBER() OVER (PARTITION BY "as"."certificationCourseId" ORDER BY "as"."state", "as"."createdAt" DESC) as priority
      FROM "assessments" as "as"
      WHERE "as"."certificationCourseId" IS NOT NULL
    )
    UPDATE "assessments"
    SET "certificationCourseId" = NULL
    FROM ASSESSMENTS_BY_CERTIFICATION_COURSES
    WHERE ASSESSMENTS_BY_CERTIFICATION_COURSES.assessment_id = "assessments"."id"
      AND cnt_assessments_per_certification_course > 1 
      AND priority <> 1;
  `);

  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique([COLUMN_USER_ID, COLUMN_CERTIFICATION_COURSE_ID]);
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique([COLUMN_USER_ID, COLUMN_CERTIFICATION_COURSE_ID]);
  });
};
