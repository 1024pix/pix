exports.up = (knex) => {
  return knex.raw(
    'CREATE INDEX IF NOT EXISTS "knowledge_elements_assessmentid_index" on "knowledge-elements" ("assessmentId")'
  );
};

exports.down = function (knex) {
  return knex.raw('DROP INDEX "knowledge_elements_assessmentid_index"');
};
