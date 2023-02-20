const TABLE_NAME = 'campaigns';
const TITLE_COLUMN = 'alternativeTextToExternalIdHelpImage';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text(TITLE_COLUMN);
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(TITLE_COLUMN);
  });
};
