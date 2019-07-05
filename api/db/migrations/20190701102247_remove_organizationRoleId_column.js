const TABLE_NAME = 'memberships';

exports.up = async function(knex) {
  const info = await knex(TABLE_NAME).columnInfo();
  if (info.organisationRoleId) {
    await knex.schema.alterTable(TABLE_NAME, (table) => {
      table.dropForeign('organizationRoleId');
      table.dropColumn('organizationRoleId');
    });
  }

  await knex.schema.table(TABLE_NAME, (table) => {
    table.string('organizationRole').notNullable().defaultTo('MEMBER');
  });
};

exports.down = async function(knex) {
  const info = await knex(TABLE_NAME).columnInfo();
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    if (info.organisationRoleId) {
      table.bigInteger('organizationRoleId').references('organization-roles.id').index();
    }
    table.dropColumn('organizationRole');
  });

  await knex.raw(`
    update ${TABLE_NAME} 
    set "organizationRoleId" = ( select id from "organization-roles" where name ='ADMIN' );
  `);
};
