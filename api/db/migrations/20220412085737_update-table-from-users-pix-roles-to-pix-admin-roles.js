const OLD_TABLE_NAME = 'users_pix_roles';
const NEW_TABLE_NAME = 'pix-admin-roles';
const ROLE_COLUMN = 'role';
const CREATED_AT_COLUMN = 'createdAt';
const UPDATED_AT_COLUMN = 'updatedAt';
const DISABLED_AT_COLUMN = 'disabledAt';
const OLD_COLUMN_NAME = 'user_id';
const NEW_COLUMN_NAME = 'userId';
const COLUMN_TO_DELETE = 'pix_role_id';

export const up = async function (knex) {
  await knex.schema.renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME);
  await knex.schema.table(NEW_TABLE_NAME, (table) => {
    table.string(ROLE_COLUMN);
    table.dateTime(CREATED_AT_COLUMN).notNullable().defaultTo(knex.fn.now());
    table.dateTime(UPDATED_AT_COLUMN);
    table.dateTime(DISABLED_AT_COLUMN);
    table.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME);
  });

  await knex(NEW_TABLE_NAME).update({
    [ROLE_COLUMN]: 'SUPER_ADMIN',
  });

  await knex.schema.alterTable(NEW_TABLE_NAME, function (table) {
    table.string(ROLE_COLUMN).notNullable().alter();
  });

  await knex.schema.table(NEW_TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_TO_DELETE);
  });
};

export const down = async function (knex) {
  await knex.schema.renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME);

  await knex.schema.table(OLD_TABLE_NAME, (table) => {
    table.dropColumn(ROLE_COLUMN);
    table.dropColumn(CREATED_AT_COLUMN);
    table.dropColumn(UPDATED_AT_COLUMN);
    table.dropColumn(DISABLED_AT_COLUMN);
    table.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME);
  });
};
