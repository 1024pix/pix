const TABLE_NAME = 'pix_roles';
const ROW = { name: 'PIX_READER' };

export const up = function (knex) {
  return knex.table(TABLE_NAME).where('name', ROW.name).delete();
};

export const down = function (knex) {
  return knex.table(TABLE_NAME).insert(ROW);
};
