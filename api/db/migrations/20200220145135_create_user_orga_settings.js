const TABLE_NAME = 'user-orga-settings';

exports.up = (knex) => {

  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').primary();
    t.bigInteger('userId').references('users.id').index();
    t.bigInteger('currentOrganizationId').references('organizations.id');
    t.unique(['userId']);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
