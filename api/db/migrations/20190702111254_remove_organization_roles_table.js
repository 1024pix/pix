const TABLE_NAME = 'organization-roles';

exports.up = function(knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

exports.down = function(knex) {
  return knex.schema
    .createTable(TABLE_NAME, (table) => {
      table.increments('id').primary();
      table.string('name');
    })
    .then(() => {
      const roles = [
        { name: 'ADMIN' },
      ];

      return knex.batchInsert(TABLE_NAME, roles);
    });
};
