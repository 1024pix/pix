const TABLE_NAME = 'certification-partner-acquisitions';

exports.up = async (knex) => {

  return knex.schema.createTable(TABLE_NAME, (table) => {
    table
      .integer('certificationCourseId')
      .references('certification-courses.id')
      .notNullable()
      .index();
    table
      .string('partnerKey')
      .references('badges.key')
      .notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
