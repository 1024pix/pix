const TABLE_NAME = 'memberships';
const TABLE_NAME_COPY = 'memberships2';

exports.up = async function(knex) {

  await knex.schema.createTable(TABLE_NAME_COPY, (table) => {
    table.increments('id').primary();
    table.bigInteger('userId').references('users.id').index();
    table.bigInteger('organizationId').references('organizations.id').index();
    table.unique(['userId', 'organizationId']);
  });

  const rows = await knex.select('id', 'userId', 'organizationId').from(TABLE_NAME);

  await knex.batchInsert(TABLE_NAME_COPY, rows);

  await knex.schema.dropTable(TABLE_NAME);
  await knex.schema.renameTable(TABLE_NAME_COPY, TABLE_NAME);

  await knex.schema.table(TABLE_NAME, (table) => {
    table.string('organizationRole').defaultTo('OWNER');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.bigInteger('organizationRoleId').references('organization-roles.id').defaultTo(1).index();
    table.dropColumn('organizationRole');
  });
};
