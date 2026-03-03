const TABLE_NAME = 'fct_structures';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.comment('This fact table contains the links between structures, networks and organizations.');
    table.integer('structure_id').notNullable().comment('References the ID of the structure.');
    table.integer('network_id').nullable().comment('References the ID of the network if any.');
    table.integer('parent_structure_id').nullable().comment('References the ID of the parent structure if any.');
    table.integer('child_structure_id').nullable().comment('References the ID of the child structure if any.');
    table.integer('organization_id').nullable().comment('References the ID of the organization if any.');

    table.foreign('structure_id').references('structures.id');
    table.foreign('network_id').references('networks.id');
    table.foreign('parent_structure_id').references('structures.id');
    table.foreign('child_structure_id').references('structures.id');
    table.foreign('organization_id').references('organizations.id');
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
