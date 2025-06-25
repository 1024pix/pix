const OLD_TABLE_NAME = 'active_calibrated_challenges';
const NEW_TABLE_NAME = 'calibrated_challenges';

const up = async function (knex) {
  await knex.schema.renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME);
};

const down = async function (knex) {
  await knex.schema.renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME);
};

export { down, up };
