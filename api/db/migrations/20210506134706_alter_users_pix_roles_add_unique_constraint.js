const TABLE_NAME = 'users_pix_roles';
const COLUMNS_NAME = ['user_id', 'pix_role_id'];

const up = async function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(COLUMNS_NAME);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(COLUMNS_NAME);
  });
};

export { up, down };
