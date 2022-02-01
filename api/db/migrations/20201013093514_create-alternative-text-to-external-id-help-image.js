const TABLE_NAME = 'campaigns';
const TITLE_COLUMN = 'alternativeTextToExternalIdHelpImage';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text(TITLE_COLUMN);
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(TITLE_COLUMN);
  });
};
