const TABLE_NAME = 'campaign-participations';
const COLUMN = 'isCertifiable';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.boolean(COLUMN).nullable().defaultTo(null);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(COLUMN);
  });
};

export { up, down };
