const TABLE_NAME = 'certification-challenges';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('associatedSkillId');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('associatedSkillId');
  });
};
