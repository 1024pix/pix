const OLD_NAME = 'knowledge-element-snapshots';
const NEW_NAME = 'knowledge-state-snapshots';

/**
 * L'instantané d'une participation ne retient plus une liste de knowledge
 * elements mais un état de connaissance par tube. La table prend le nom de ce
 * qu'elle contient. Les instantanés historiques — reconnaissables à leur forme
 * de tableau — restent lisibles tels quels, aucune reprise n'est nécessaire.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.renameTable(OLD_NAME, NEW_NAME);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.renameTable(NEW_NAME, OLD_NAME);
}
