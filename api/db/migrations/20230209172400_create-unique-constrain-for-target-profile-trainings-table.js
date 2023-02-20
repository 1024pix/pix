const TABLE_NAME = 'target-profile-trainings';

export const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (t) {
    t.unique(['targetProfileId', 'trainingId']);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['targetProfileId', 'trainingId']);
  });
};
