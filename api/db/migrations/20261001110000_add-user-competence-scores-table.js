const TABLE_NAME = 'user_competence_scores';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.integer('userId').references('users.id').notNullable();
    table.string('competenceId').notNullable();
    table.double('pix').notNullable().defaultTo(0);
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.primary(['userId', 'competenceId']);
    table.check('"pix" BETWEEN 0 AND 64', [], 'user_competence_scores_pix_range');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async (knex) => {
  await knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
