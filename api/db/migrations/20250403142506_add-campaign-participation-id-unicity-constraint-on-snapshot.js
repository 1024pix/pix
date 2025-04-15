const TABLE_NAME = 'knowledge-element-snapshots';
const COLUMN_NAME = 'campaignParticipationId';
const CONSTRAINT_NAME = 'one_snapshot_by_campaignParticipationId';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  const result = await knex.raw(
    `select constraint_name
                   from information_schema.constraint_column_usage
                   where table_name = :tableName  and constraint_name = :constraintName`,
    {
      tableName: TABLE_NAME,
      constraintName: CONSTRAINT_NAME,
    },
  );

  if (result.rowCount === 1) {
    return;
  }
  await knex.raw('ALTER TABLE :tableName: ADD CONSTRAINT :constraintName: UNIQUE (:columnName:)', {
    tableName: TABLE_NAME,
    constraintName: CONSTRAINT_NAME,
    columnName: COLUMN_NAME,
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropUnique(COLUMN_NAME, CONSTRAINT_NAME);
  });
};

export { down, up };
