const TABLE_NAME = 'tutorial-evaluations';
const COLUMN_NAME = 'status';
const EVALUATION_STATUS = {
  LIKED: 'LIKED',
  NEUTRAL: 'NEUTRAL',
};

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.enu(COLUMN_NAME, [EVALUATION_STATUS.LIKED, EVALUATION_STATUS.NEUTRAL]).defaultTo('LIKED');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
