const TABLE_NAME = 'knowledge-states';

/**
 * État de connaissance de l'utilisateur, une ligne par tube.
 *
 * Remplace la persistance d'un enregistrement par acquis. L'inférence ne se
 * propageant que dans le tube — vers le bas quand la réponse est juste, vers le
 * haut quand elle est fausse — deux bornes suffisent à décrire l'ensemble des
 * acquis validés et invalidés.
 *
 * `directLevels` retient les niveaux réellement testés, par opposition à ceux
 * qui n'ont été qu'inférés : l'algorithme de sélection estime le niveau de
 * l'utilisateur à partir des seules réponses directes.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.integer('userId').references('users.id').notNullable();
    table.string('tubeId').notNullable();
    table.integer('floor').notNullable().defaultTo(0);
    table.integer('ceiling').nullable();
    table.specificType('directLevels', 'integer[]').notNullable().defaultTo('{}');
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.unique(['userId', 'tubeId']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
