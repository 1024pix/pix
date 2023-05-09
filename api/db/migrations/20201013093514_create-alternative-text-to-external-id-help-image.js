const TABLE_NAME = 'campaigns';
const TITLE_COLUMN = 'alternativeTextToExternalIdHelpImage';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text(TITLE_COLUMN);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(TITLE_COLUMN);
  });
};

export { up, down };
