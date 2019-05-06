
exports.up = async function(knex) {
  await knex.schema.table('users', (table) => {
    table.integer('boardOrganizationId').unsigned().references('organizations.id').index();
  });

  await knex.raw(`UPDATE users SET "boardOrganizationId" =
                   (SELECT id FROM organizations WHERE "userId" = users.id LIMIT 1)
                  WHERE id IN (SELECT DISTINCT "userId" FROM organizations)`);
};

exports.down = async function(knex) {
  await knex.schema.table('users', (table) => {
    table.dropColumn('boardOrganizationId');
  });
};
