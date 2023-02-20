const TABLE_NAME = 'certification-courses';
const EXAMINER_COMMENT_NAME = 'examinerComment';
const HAS_SEEN_END_TEST_SCREEN_NAME = 'hasSeenEndTestScreen';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(EXAMINER_COMMENT_NAME, 500);
    table.boolean(HAS_SEEN_END_TEST_SCREEN_NAME).defaultTo(false);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(EXAMINER_COMMENT_NAME);
    table.dropColumn(HAS_SEEN_END_TEST_SCREEN_NAME);
  });
};
