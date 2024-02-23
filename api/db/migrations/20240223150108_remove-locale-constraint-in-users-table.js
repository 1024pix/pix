const up = async function (knex) {
  return knex.raw('ALTER TABLE "users" DROP CONSTRAINT "users_locale_check"');
};

const down = async function (knex) {
  return knex.raw(
    "ALTER TABLE \"users\" ADD CONSTRAINT \"users_locale_check\" CHECK ( \"locale\" IN ('en', 'fr', 'fr-FR', 'fr-BE') )",
  );
};

export { up, down };
