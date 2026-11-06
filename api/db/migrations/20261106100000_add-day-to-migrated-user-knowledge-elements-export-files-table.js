const TABLE_NAME = 'migrated_user_knowledge_elements_export_files';
const CHECK_NAME = 'migrated_user_knowledge_elements_export_files_filename_in_day';

/**
 * The day of a file of the export: the day of creation, in Paris time, of all
 * its knowledge elements. The files are partitioned by that day in the data lake,
 * `<prefix>/YYYY/MM/DD/<firstId>_<lastId>.parquet`, and the check keeps the
 * name of a file in the partition of its day.
 *
 * The export has not run before this migration, so the table has no row to
 * give a day to.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async (knex) => {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table
      .date('day')
      .notNullable()
      .comment('The day of creation, in Paris time, of all the knowledge elements of the file: its folder YYYY/MM/DD');
    table.check(`"filename" LIKE '%/' || to_char("day", 'YYYY/MM/DD') || '/%'`, [], CHECK_NAME);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async (knex) => {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropChecks([CHECK_NAME]);
    table.dropColumn('day');
  });
};

export { down, up };
