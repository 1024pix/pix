const TABLE_NAME = 'certification-center-memberships';
const COLUMN_NAME = 'role';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.enum(COLUMN_NAME, ['MEMBER', 'ADMIN']).defaultTo('MEMBER');
  });
  await knex(TABLE_NAME).update({ [COLUMN_NAME]: 'MEMBER' });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
