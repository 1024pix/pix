const up = function (knex) {
  return knex.raw('CREATE INDEX "assessment_courseid_index" ON assessments ("courseId");');
};

const down = function (knex) {
  return knex.raw('DROP INDEX "assessment_courseid_index";');
};

export { up, down };
