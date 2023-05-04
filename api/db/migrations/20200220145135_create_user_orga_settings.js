const TABLE_NAME = 'user-orga-settings';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').primary();
    t.bigInteger('userId').references('users.id').index();
    t.bigInteger('currentOrganizationId').references('organizations.id');
    t.unique(['userId']);
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
