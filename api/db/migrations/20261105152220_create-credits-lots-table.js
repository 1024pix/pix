const TABLE_NAME = 'credits_lots';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.comment('This table contains the lots of credits associated with structures.');
    table.increments('id').primary();
    table
      .integer('structure_id')
      .notNullable()
      .references('structures.id')
      .comment('References the ID of the structure.');
    table.integer('count').notNullable();
    table.date('activation_date').notNullable();
    table.date('expiration_date').notNullable();
    table.string('reference').notNullable().comment('A reference number to link to a quotation or an invoice');
    table
      .integer('created_by')
      .notNullable()
      .references('users.id')
      .comment('References the ID of the user who created the lot.');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
