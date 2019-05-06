
exports.up = async function(knex) {
  await knex.schema.table('organizations', (table) => {
    table.dropColumn('userId');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('organizations', (table) => {
    table.integer('userId').unsigned().references('users.id').index();
  });
  await knex.raw(`UPDATE organizations SET "userId" =
                   (SELECT id FROM users WHERE "boardOrganizationId" = organizations.id LIMIT 1)
                  WHERE id IN (SELECT DISTINCT "boardOrganizationId" FROM users)`);
};
