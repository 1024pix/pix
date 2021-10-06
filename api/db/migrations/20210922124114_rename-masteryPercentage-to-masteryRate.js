const TABLE_NAME = 'campaign-participations';
const OLD_COLUMN_NAME = 'masteryPercentage';
const NEW_COLUMN_NAME = 'masteryRate';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME));
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME));
};
