const TABLE_NAME = 'certification-partner-acquisitions';

export const up = async (knex) => {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.integer('certificationCourseId').references('certification-courses.id').notNullable().index();
    table.string('partnerKey').references('badges.key').notNullable();
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
