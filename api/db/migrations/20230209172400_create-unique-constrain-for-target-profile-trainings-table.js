const TABLE_NAME = 'target-profile-trainings';

const up = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, function (t) {
    t.unique(['targetProfileId', 'trainingId']);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['targetProfileId', 'trainingId']);
  });
};

export { up, down };
