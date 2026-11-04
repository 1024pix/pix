const TABLE_NAME = 'migrated_user_knowledge_elements_export_files';

/**
 * The files of the export of `migrated_user_knowledge_elements` to the data
 * lake. A file is recorded before its upload, and completed once its rows are
 * marked as exported, in the same transaction. A run writes again, to their
 * recorded name, the files left incomplete by a previous run: a row is never
 * in two files.
 */
const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id');
    table.string('filename').notNullable().unique().comment('The name of the file in the bucket');
    table.bigInteger('first_id').notNullable().comment('The id of the first knowledge element of the file');
    table.bigInteger('last_id').notNullable().comment('The id of the last knowledge element of the file');
    table
      .integer('row_count')
      .notNullable()
      .comment(
        'The number of knowledge elements of the file. Less than the span of ids: the ids are drawn from the sequence shared with knowledge-elements, so they have gaps',
      );
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table
      .dateTime('completed_at')
      .nullable()
      .comment('When the knowledge elements of the file were marked as exported');
  });
};

const down = async (knex) => {
  await knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
