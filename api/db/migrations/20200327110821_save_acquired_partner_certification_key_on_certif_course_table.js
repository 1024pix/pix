const TABLE_NAME = 'certification-partner-acquisitions';

const up = async function(knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.integer('certificationCourseId').references('certification-courses.id').notNullable().index();
    table.string('partnerKey').references('badges.key').notNullable();
  });
};

const down = function(knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
