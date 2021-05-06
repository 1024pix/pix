const TABLE_NAME = 'pix_roles';
const ROW = { name: 'PIX_READER' };

exports.up = function(knex) {
  return knex.table(TABLE_NAME).where('name', ROW.name).delete();
};

exports.down = function(knex) {
  return knex.table(TABLE_NAME).insert(ROW);
};
