const TABLE_NAME = 'certification_versions';
const COLUMN_NAME = 'minimumAnswersRequiredToValidateACertification';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .integer(COLUMN_NAME)
      .comment(
        'Minimum number of answers required to validate a certification. Any certification finalized with less answers than specified would be cancelled or rejected (depending on abort reason)',
      );
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
