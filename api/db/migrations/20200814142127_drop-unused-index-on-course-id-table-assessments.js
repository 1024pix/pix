const up = function (knex) {
  return knex.raw('DROP INDEX IF EXISTS "assessment_courseid_index";');
};

const down = function (knex) {
  return knex.raw('CREATE INDEX "assessment_courseid_index" ON assessments ("courseId");');
};

export { up, down };
