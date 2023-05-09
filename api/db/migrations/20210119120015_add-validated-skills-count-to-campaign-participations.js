const TABLE_NAME = 'campaign-participations';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer('validatedSkillsCount');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('validatedSkillsCount');
  });
};

export { up, down };
