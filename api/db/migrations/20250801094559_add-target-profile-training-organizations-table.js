const TABLE_NAME = 'target-profile-training-organizations';

/**
 * Une ligne dans cette table permet à une organisation de recommander un CF par l'intermédiaire d'un PC.
 * Le lien avec le profil cible est nécessaire car une organisation peut être relié au même CF pour plusieurs PC
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments('id').primary();
    table.integer('organizationId').unsigned();
    table.foreign('organizationId').references('organizations.id');
    table.integer('targetProfileTrainingId').unsigned();
    table.foreign('targetProfileTrainingId').references('target-profile-trainings.id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
