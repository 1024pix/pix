const TABLE_NAME = 'organization-roles';

const up = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

const down = function (knex) {
  return knex.schema
    .createTable(TABLE_NAME, (table) => {
      table.increments('id').primary();
      table.string('name');
    })
    .then(() => {
      const roles = [{ name: 'ADMIN' }];

      return knex.batchInsert(TABLE_NAME, roles);
    });
};

export { up, down };
