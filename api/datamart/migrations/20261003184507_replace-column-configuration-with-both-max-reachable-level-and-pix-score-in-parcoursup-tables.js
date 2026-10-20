const TABLE_NAME_1 = 'sco_certification_results';
const TABLE_NAME_2 = 'certification_results';
const CONFIGURATION_COLUMN = 'configuration';
const MAX_REACHABLE_LEVEL_COLUMN = 'max_reachable_level';
const MAX_REACHABLE_PIX_SCORE_COLUMN = 'max_reachable_pix_score';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME_1, function (table) {
    table.dropColumn(CONFIGURATION_COLUMN);
    table
      .integer(MAX_REACHABLE_LEVEL_COLUMN)
      .defaultTo(null)
      .comment('Niveau max atteignable par le candidat au moment de son passage de certification');
    table
      .integer(MAX_REACHABLE_PIX_SCORE_COLUMN)
      .defaultTo(null)
      .comment('Score pix max atteignable par le candidat au moment de son passage de certification');
  });
  await knex.schema.table(TABLE_NAME_2, function (table) {
    table.dropColumn(CONFIGURATION_COLUMN);
    table
      .integer(MAX_REACHABLE_LEVEL_COLUMN)
      .defaultTo(null)
      .comment('Niveau max atteignable par le candidat au moment de son passage de certification');
    table
      .integer(MAX_REACHABLE_PIX_SCORE_COLUMN)
      .defaultTo(null)
      .comment('Score pix max atteignable par le candidat au moment de son passage de certification');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME_1, function (table) {
    table.dropColumn(MAX_REACHABLE_LEVEL_COLUMN);
    table.dropColumn(MAX_REACHABLE_PIX_SCORE_COLUMN);
    table.jsonb(CONFIGURATION_COLUMN).defaultTo(null).comment('Configuration of scoring for certification');
  });
  await knex.schema.table(TABLE_NAME_2, function (table) {
    table.dropColumn(MAX_REACHABLE_LEVEL_COLUMN);
    table.dropColumn(MAX_REACHABLE_PIX_SCORE_COLUMN);
    table.jsonb(CONFIGURATION_COLUMN).defaultTo(null).comment('Configuration of scoring for certification');
  });
};

export { down, up };
