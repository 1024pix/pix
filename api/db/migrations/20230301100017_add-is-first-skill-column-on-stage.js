const TABLE_NAME = 'stages';
const IS_FIRST_SKILL = 'isFirstSkill';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(IS_FIRST_SKILL).defaultTo(false);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(IS_FIRST_SKILL);
  });
};

export { up, down };
