const up = function (knex) {
  return knex.raw(
    'ALTER INDEX IF EXISTS "knowledge-elements_assessmentId_idx" RENAME TO "knowledge_elements_assessmentid_index"',
  );
};
// biome-ignore lint: no empty block
const down = function () {};
export { up, down };
