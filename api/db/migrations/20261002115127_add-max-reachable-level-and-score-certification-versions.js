const TABLE_NAME = 'certification_versions';
const COLUMN1_NAME = 'maxReachableLevel';
const COLUMN2_NAME = 'maxReachablePixScore';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN1_NAME).defaultTo(null).comment('Maximal reachable level');
    table.integer(COLUMN2_NAME).defaultTo(null).comment('Maximal reachable Pix score');
  });

  await knex.raw(
    `
    UPDATE ?? SET ?? = (JSONB_ARRAY_LENGTH("globalScoringConfiguration") - 1)
    WHERE jsonb_typeof("globalScoringConfiguration") = 'array'
    `,
    [TABLE_NAME, COLUMN1_NAME],
  );

  await knex.raw(
    `
    UPDATE ?? SET ?? = (JSONB_ARRAY_LENGTH("globalScoringConfiguration") - 1)
      * JSONB_ARRAY_LENGTH("competencesScoringConfiguration")
      * 8
    WHERE jsonb_typeof("globalScoringConfiguration") = 'array'
      AND jsonb_typeof("competencesScoringConfiguration") = 'array';
  `,
    [TABLE_NAME, COLUMN2_NAME],
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN1_NAME);
    table.dropColumn(COLUMN2_NAME);
  });
}
