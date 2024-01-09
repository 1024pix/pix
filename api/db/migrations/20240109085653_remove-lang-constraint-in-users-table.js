const up = async function (knex) {
  return knex.raw('ALTER TABLE "users" DROP CONSTRAINT "users_lang_check"');
};

const down = async function (knex) {
  return knex.raw('ALTER TABLE "users" ADD CONSTRAINT "users_lang_check" CHECK ( "lang" IN (\'fr\', \'en\') )');
};

export { up, down };
