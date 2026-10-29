const TABLE_NAME = 'migrated_user_knowledge_elements';

/**
 * The knowledge elements produced by a user migrated to knowledge states.
 * Once migrated, a user is served from `knowledge_states`, and the knowledge
 * elements their answers keep producing are written here instead of in
 * `knowledge-elements`, so that they can be exported to the data lake.
 *
 * The id is drawn from the sequence of `knowledge-elements`, so a row keeps an
 * id unique across the two tables. That sequence is owned by
 * `knowledge-elements.id`
 *
 * The table is only read for the export:
 * it has no index nor foreign key.
 */
const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw(`nextval('"knowledge-elements_id_seq"')`));
    table.string('source').notNullable();
    table.string('status').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.bigInteger('answerId').nullable().comment('Null on a reset: the knowledge element comes from no answer');
    table.integer('assessmentId').nullable().comment('Null on a reset: the knowledge element comes from no assessment');
    table.string('skillId').notNullable();
    table.float('earnedPix').notNullable().defaultTo(0);
    table.integer('userId').notNullable();
    table.string('competenceId').notNullable();
    table.dateTime('savedAt').nullable().comment('When the row was exported to the data lake');
  });
};

const down = async (knex) => {
  await knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
