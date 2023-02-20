export const up = (knex) => {
  return knex.raw('CREATE INDEX "assessment_courseid_index" ON assessments ("courseId");');
};

export const down = (knex) => {
  return knex.raw('DROP INDEX "assessment_courseid_index";');
};
