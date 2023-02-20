const TABLE_NAME = 'stages';
const PRESCRIBER_TITLE_COLUMN = 'prescriberTitle';
const PRESCRIBER_DESCRIPTION_COLUMN = 'prescriberDescription';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string(PRESCRIBER_TITLE_COLUMN);
    table.text(PRESCRIBER_DESCRIPTION_COLUMN);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(PRESCRIBER_TITLE_COLUMN);
    table.dropColumn(PRESCRIBER_DESCRIPTION_COLUMN);
  });
};
