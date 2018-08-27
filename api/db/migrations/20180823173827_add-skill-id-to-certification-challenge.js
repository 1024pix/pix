const TABLE_NAME = 'certification-challenges';

exports.up = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('associatedSkillId');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('associatedSkillId');
  });
};
