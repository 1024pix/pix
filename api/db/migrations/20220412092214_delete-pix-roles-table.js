const TABLE_NAME_TO_DELETE = 'pix_roles';
const TABLE_NAME_TO_UPDATE = 'pix-admin-roles';
const COLUMN_TO_DELETE = 'pix_role_id';

export const up = async (knex) => {
  await knex.schema.dropTable(TABLE_NAME_TO_DELETE);
};

export const down = async (knex) => {
  await knex.schema.createTable(TABLE_NAME_TO_DELETE, (table) => {
    table.increments('id').primary();
    table.string('name').notNull();
  });

  const [pixRoleId] = await knex(TABLE_NAME_TO_DELETE).insert({ name: 'PIX_MASTER' }).returning('id');

  await knex.schema.table(TABLE_NAME_TO_UPDATE, (table) => {
    table.bigInteger(COLUMN_TO_DELETE).defaultTo(pixRoleId).references(`${TABLE_NAME_TO_DELETE}.id`);
  });
};
