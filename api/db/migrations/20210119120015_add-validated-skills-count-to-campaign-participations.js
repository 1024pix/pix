const TABLE_NAME = 'campaign-participations';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer('validatedSkillsCount');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('validatedSkillsCount');
  });
};
