const TABLE_NAME = 'users';
const COLUMN_NAME = 'locale';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME).defaultTo(null);
  });

  return knex.raw(
    `ALTER TABLE "users" ADD CONSTRAINT "users_locale_check" CHECK ( "locale" IN ('fr', 'en', 'fr-FR', 'fr-BE') )`
  );
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
