const TABLE_NAME = 'certification-challenges';
const OLD_COLUMN_NAME = 'associatedSkill';
const NEW_COLUMN_NAME = 'associatedSkillName';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME));
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME));
};

export { up, down };
