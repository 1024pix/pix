const up = function (knex) {
  return knex.raw(
    'CREATE INDEX IF NOT EXISTS "knowledge-elements_assessmentId_idx" on "knowledge-elements" ("assessmentId")'
  );
};

const down = function (knex) {
  return knex.raw('DROP INDEX "knowledge-elements_assessmentId_idx"');
};

export { up, down };
