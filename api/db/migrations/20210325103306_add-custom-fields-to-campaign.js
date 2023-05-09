const TABLE_NAME = 'campaigns';
const CUSTOM_RESULT_PAGE_TEXT_COLUMN = 'customResultPageText';
const CUSTOM_RESULT_PAGE_BUTTON_TEXT_COLUMN = 'customResultPageButtonText';
const CUSTOM_RESULT_PAGE_BUTTON_URL_COLUMN = 'customResultPageButtonUrl';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.text(CUSTOM_RESULT_PAGE_TEXT_COLUMN);
    table.string(CUSTOM_RESULT_PAGE_BUTTON_TEXT_COLUMN);
    table.text(CUSTOM_RESULT_PAGE_BUTTON_URL_COLUMN);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(CUSTOM_RESULT_PAGE_TEXT_COLUMN);
    table.dropColumn(CUSTOM_RESULT_PAGE_BUTTON_TEXT_COLUMN);
    table.dropColumn(CUSTOM_RESULT_PAGE_BUTTON_URL_COLUMN);
  });
};

export { up, down };
