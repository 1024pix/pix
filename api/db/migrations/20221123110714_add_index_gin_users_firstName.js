exports.up = async function (knex) {
  await knex.raw(`CREATE INDEX "users_firstName_gin" ON users USING GIN ("firstName" GIN_TRGM_OPS)`);
};

exports.down = async function (knex) {
  await knex.raw(`DROP INDEX "users_firstName_gin"`);
};
