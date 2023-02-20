const TABLE_NAME = 'memberships';

export const up = async function (knex) {
  const info = await knex(TABLE_NAME).columnInfo();
  if (info.organizationRoleId) {
    await knex.schema.alterTable(TABLE_NAME, (table) => {
      table.dropColumn('organizationRoleId');
    });
  }

  await knex.schema.table(TABLE_NAME, (table) => {
    table.string('organizationRole').notNullable().defaultTo('MEMBER');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.bigInteger('organizationRoleId').references('organization-roles.id').index();
    table.dropColumn('organizationRole');
  });

  await knex.raw('UPDATE ?? SET ?? = (SELECT id FROM ?? WHERE name = ?);', [
    TABLE_NAME,
    'organizationRoleId',
    'organization-roles',
    'ADMIN',
  ]);
};
