const TABLE_NAME = 'target-profiles';
const INTERNAL_NAME_COLUMN = 'internalName';
const NAME_COLUMN = 'name';

const up = async function (knex) {
  // add column
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table
      .string(INTERNAL_NAME_COLUMN)
      .comment('Internal name of the target profile, used for target profiles administration, not displayed to users');
  });

  // copy data from name to internalName
  await knex.raw(
    `
      UPDATE :tableName:
      SET :internalNameColumn: = :columnName:
    `,
    {
      tableName: TABLE_NAME,
      internalNameColumn: INTERNAL_NAME_COLUMN,
      columnName: NAME_COLUMN,
    },
  );

  // add not null constraint on internalName column
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string(INTERNAL_NAME_COLUMN).notNullable().alter();
  });
};

const down = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.dropColumn(INTERNAL_NAME_COLUMN);
  });
};

export { down, up };
