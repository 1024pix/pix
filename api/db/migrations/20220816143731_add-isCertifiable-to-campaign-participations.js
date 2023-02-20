const TABLE_NAME = 'campaign-participations';
const COLUMN = 'isCertifiable';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.boolean(COLUMN).nullable().defaultTo(null);
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(COLUMN);
  });
};
