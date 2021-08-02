exports.up = (knex) => {
  // cspell:disable-next
  return knex.raw('DROP INDEX IF EXISTS "assessment_courseid_index";');
};

exports.down = (knex) => {
  // cspell:disable-next
  return knex.raw('CREATE INDEX "assessment_courseid_index" ON assessments ("courseId");');
};
