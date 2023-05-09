const TABLE_NAME = 'certification-challenges';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('associatedSkillId');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('associatedSkillId');
  });
};

export { up, down };
