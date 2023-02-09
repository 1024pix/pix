const TABLE_NAME = 'target-profile-trainings';

exports.up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (t) {
    t.unique(['targetProfileId', 'trainingId']);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['targetProfileId', 'trainingId']);
  });
};
