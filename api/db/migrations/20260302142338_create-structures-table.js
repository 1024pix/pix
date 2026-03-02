const TABLE_NAME = 'structures';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments('id').primary();
    table.integer('level').notNullable().defaultTo(0);
    table.integer('network_id').unsigned().nullable();
    table.foreign('network_id').references('id').inTable('networks');
    table.integer('parent_structure_id').unsigned().nullable();
    table.foreign('parent_structure_id').references('id').inTable(TABLE_NAME);
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updatedAt').defaultTo(knex.fn.now());

    table.index('parent_structure_id');
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
