import { up as autonomousCoursesTableCreation } from './20231030144246_create_autonomous_courses.js';

const TABLE_NAME = 'autonomous-courses';

const up = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
};

const down = autonomousCoursesTableCreation;

export { up, down };
