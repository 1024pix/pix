const MESHES_ALL_TABLE_NAME = 'data_scoring_meshes_all';
const MESHES_TABLE_NAME = 'data_scoring_meshes';
const THRESHOLDS_ALL_TABLE_NAME = 'data_scoring_thresholds_all';
const THRESHOLDS_TABLE_NAME = 'data_scoring_thresholds';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(MESHES_ALL_TABLE_NAME, function (table) {
    table.integer('id').notNullable().comment('Scoring meshes set ID');
    table.integer('calibration_id').index().comment("Calibration identifier - see 'data_calibrations' table");
    table.string('status').notNullable().comment('Validation status of the scoring meshes set');
  });

  await knex.schema.createTable(MESHES_TABLE_NAME, function (table) {
    table
      .integer('scoring_meshes_all_id')
      .index()
      .comment("Scoring meshes set identifier - see 'data_scoring_meshes_all' table");
    table.integer('mesh').comment('Mesh index, from the lowest to the highest reachable mesh');
    table.double('min_bound_curated_value').comment('Curated lower capacity bound of the mesh');
    table.double('max_bound_curated_value').comment('Curated upper capacity bound of the mesh');
  });

  await knex.schema.createTable(THRESHOLDS_ALL_TABLE_NAME, function (table) {
    table.integer('id').notNullable().comment('Scoring thresholds set ID');
    table.integer('calibration_id').index().comment("Calibration identifier - see 'data_calibrations' table");
    table.string('status').notNullable().comment('Validation status of the scoring thresholds set');
  });

  await knex.schema.createTable(THRESHOLDS_TABLE_NAME, function (table) {
    table
      .integer('scoring_thresholds_all_id')
      .index()
      .comment("Scoring thresholds set identifier - see 'data_scoring_thresholds_all' table");
    table.integer('level').comment('Competence level reached within these capacity bounds');
    table.string('competence_id').index().comment('Learning content competence identifier');
    table.double('min_bound_curated_value').comment('Curated lower capacity bound of the competence level');
    table.double('max_bound_curated_value').comment('Curated upper capacity bound of the competence level');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(THRESHOLDS_TABLE_NAME);
  await knex.schema.dropTable(THRESHOLDS_ALL_TABLE_NAME);
  await knex.schema.dropTable(MESHES_TABLE_NAME);
  await knex.schema.dropTable(MESHES_ALL_TABLE_NAME);
}
