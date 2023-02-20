export const up = (knex) => {
  return knex.raw(
    'ALTER INDEX IF EXISTS "knowledge-elements_assessmentId_idx" RENAME TO "knowledge_elements_assessmentid_index"'
  );
};

export const down = function () {
  // no rollback for this case
};
