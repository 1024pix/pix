const TABLE_NAME = 'campaign-participations';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer('validatedSkillsCount');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('validatedSkillsCount');
  });
};
