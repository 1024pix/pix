const TABLE_NAME = 'certification_versions';
const COLUMN_NAME = 'status';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME);
  });

  await knex.raw(
    `UPDATE public.certification_versions \
      SET status = CASE \
      WHEN "startDate" is null AND "expirationDate" is null THEN 'DRAFT' \
      WHEN "startDate" is not null AND "expirationDate" is null THEN 'ACTIVE' \
      WHEN "startDate" is not null AND "expirationDate" is not null THEN 'ARCHIVED' \
      END`,
  );

  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table
      .string(COLUMN_NAME)
      .alter()
      .notNullable()
      .comment('Column that can contain "DRAFT", "ACTIVE" or "ARCHIVED" values');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
}
