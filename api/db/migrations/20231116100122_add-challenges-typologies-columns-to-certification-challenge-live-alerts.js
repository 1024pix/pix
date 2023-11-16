const TABLE_NAME = 'certification-challenge-live-alerts';
const HAS_EMBED_COLUMN_NAME = 'hasEmbed';
const HAS_IMAGE_COLUMN_NAME = 'hasImage';
const HAS_ATTACHMENT_COLUMN_NAME = 'hasAttachment';
const IS_FOCUS_COLUMN_NAME = 'isFocus';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(HAS_EMBED_COLUMN_NAME).defaultTo(false);
    table.boolean(HAS_IMAGE_COLUMN_NAME).defaultTo(false);
    table.boolean(HAS_ATTACHMENT_COLUMN_NAME).defaultTo(false);
    table.boolean(IS_FOCUS_COLUMN_NAME).defaultTo(false);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(HAS_EMBED_COLUMN_NAME);
    table.dropColumn(HAS_IMAGE_COLUMN_NAME);
    table.dropColumn(HAS_ATTACHMENT_COLUMN_NAME);
    table.dropColumn(IS_FOCUS_COLUMN_NAME);
  });
};

export { up, down };
