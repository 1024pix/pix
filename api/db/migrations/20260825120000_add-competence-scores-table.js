const TABLE_NAME = 'competence-scores';

/**
 * Le score de l'utilisateur, figé à sa dernière action, une ligne par
 * compétence touchée.
 *
 * La position (`knowledge-states`) se lit contre le référentiel courant : le
 * score qui s'en déduit bougerait donc au rythme du référentiel, sans action
 * de l'utilisateur. Cette table matérialise le score au dernier moment où
 * l'utilisateur a agi — chaque réponse le recalcule, la remise à zéro
 * l'efface, rien d'autre ne le fait bouger.
 *
 * `pix` est la somme brute des pixValue validés, avant arrondi et
 * plafonnement : niveau, score entier et progression se dérivent à la lecture.
 *
 * Pas de colonne technique : le couple (userId, competenceId) est la clé.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.integer('userId').references('users.id').notNullable();
    table.string('competenceId').notNullable();
    table.float('pix').notNullable();
    table.primary(['userId', 'competenceId']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
