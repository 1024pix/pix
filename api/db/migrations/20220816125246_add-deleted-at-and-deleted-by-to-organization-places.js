const TABLE_NAME = 'organization-places';
const DELETEDAT_COLUMN = 'deletedAt';
const DELETEDBY_COLUMN = 'deletedBy';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dateTime(DELETEDAT_COLUMN).nullable();
    table.bigInteger(DELETEDBY_COLUMN).index().references('users.id').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(DELETEDAT_COLUMN);
    table.dropColumn(DELETEDBY_COLUMN);
  });
};
