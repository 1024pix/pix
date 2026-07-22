const TABLE_NAME = 'assessments';
const COLUMN_NAME = 'updatedAt';

const up = async function (knex) {
  await knex.raw('CREATE INDEX IF NOT EXISTS assessments_updated_at_index ON assessments ("updatedAt")');
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(COLUMN_NAME);
  });
};

export { down, up };
