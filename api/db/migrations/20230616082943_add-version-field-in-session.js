const TABLE_NAME = 'sessions';
const COLUMN_NAME = 'version';
const CERTIFICATION_COURSE_TABLE = 'certification-courses';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME);
  });

  await knex.raw(
    `
      UPDATE :tableName:
      SET version = :certificationCourseTable:.:columnName:
      FROM :certificationCourseTable: WHERE :certificationCourseTable:."sessionId" = :tableName:.id
    `,
    {
      tableName: TABLE_NAME,
      certificationCourseTable: CERTIFICATION_COURSE_TABLE,
      columnName: COLUMN_NAME,
    },
  );

  await knex(TABLE_NAME)
    .update({ [COLUMN_NAME]: 2 })
    .where({ [COLUMN_NAME]: null });

  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).notNullable().alter();
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
