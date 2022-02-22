const {
  createAnswersBigintMigrationDatabaseStructures,
} = require('../../../../../scripts/bigint/answer/create-migration-database-structure');
const {
  addConstraintsAndIndexesToAnswersKeBigintTemporaryTables,
} = require('../../../../../scripts/bigint/answer/add-constraints-and-indexes-to-answers-ke-temporary-tables-with-bigint.js');
const { expect, knex } = require('../../../../test-helper');

describe('#addConstraintsAndIndexesToAnswersKeBigintTemporaryTables', function () {
  beforeEach(async function () {
    // given
    await knex.raw('DROP TABLE IF EXISTS "bigint-migration-settings"');
    await knex.raw('DROP TABLE IF EXISTS "knowledge-elements_bigint"');
    await knex.raw('DROP TABLE IF EXISTS "answers_bigint"');
    await createAnswersBigintMigrationDatabaseStructures(knex);

    // when
    await addConstraintsAndIndexesToAnswersKeBigintTemporaryTables();
  });
  it('should create NOT NULL constraints', async function () {
    // then
    const { rows: notNullableAnswersBigintColumns } = await knex.raw(
      `SELECT c.column_name FROM information_schema.columns c WHERE c.table_name = 'answers_bigint' AND c.is_nullable = 'NO' ORDER BY c.column_name`
    );
    expect(notNullableAnswersBigintColumns).to.deep.equal([
      { column_name: 'challengeId' },
      { column_name: 'createdAt' },
      { column_name: 'id' },
      { column_name: 'isFocusedOut' },
      { column_name: 'updatedAt' },
    ]);
    const { rows: notNullableKnowledgeElementsBigintColumns } = await knex.raw(
      `SELECT c.column_name FROM information_schema.columns c WHERE c.table_name = 'knowledge-elements_bigint' AND c.is_nullable = 'NO' ORDER BY c.column_name`
    );
    expect(notNullableKnowledgeElementsBigintColumns).to.deep.equal([
      { column_name: 'createdAt' },
      { column_name: 'earnedPix' },
      { column_name: 'id' },
    ]);
  });
  it('should create PK constraints', async function () {
    // then
    const { rows: primaryKeyAnswersBigintColumn } = await knex.raw(
      `SELECT ccu.column_name
       FROM pg_constraint pgc
        JOIN pg_namespace nsp ON nsp.oid = pgc.connamespace
        JOIN pg_class  cls     ON pgc.conrelid = cls.oid
        JOIN information_schema.constraint_column_usage ccu ON pgc.conname = ccu.constraint_name AND nsp.nspname = ccu.constraint_schema
        WHERE pgc.contype = 'p' AND ccu.table_name = 'answers_bigint'`
    );
    expect(primaryKeyAnswersBigintColumn).to.deep.equal([{ column_name: 'id' }]);

    const { rows: primaryKeyKnowledgeElementsBigintColumn } = await knex.raw(
      `SELECT ccu.column_name
       FROM pg_constraint pgc
        JOIN pg_namespace nsp ON nsp.oid = pgc.connamespace
        JOIN pg_class  cls     ON pgc.conrelid = cls.oid
        JOIN information_schema.constraint_column_usage ccu ON pgc.conname = ccu.constraint_name AND nsp.nspname = ccu.constraint_schema
        WHERE pgc.contype = 'p' AND ccu.table_name = 'knowledge-elements_bigint'`
    );
    expect(primaryKeyKnowledgeElementsBigintColumn).to.deep.equal([{ column_name: 'id' }]);
  });
  it('should create FK constraints', async function () {
    // then
    const { rows: foreignKeysAnswersBigintColumns } = await knex.raw(
      `SELECT
          kcu.column_name  AS referencing_column_name,
          ccu.table_name   AS referenced_table_name,
          ccu.column_name  AS referenced_column_name
      FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN  information_schema.columns c
              ON  c.table_name = tc.table_name
              AND c.column_name = kcu.column_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE 1=1
        AND tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'answers_bigint'
      ORDER BY kcu.column_name
        `
    );
    expect(foreignKeysAnswersBigintColumns).to.deep.equal([
      {
        referenced_column_name: 'id',
        referenced_table_name: 'assessments',
        referencing_column_name: 'assessmentId',
      },
    ]);

    const { rows: foreignKeysKnowledgeElementsBigintColumns } = await knex.raw(
      `SELECT
          kcu.column_name  AS referencing_column_name,
          ccu.table_name   AS referenced_table_name,
          ccu.column_name  AS referenced_column_name
      FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN  information_schema.columns c
              ON  c.table_name = tc.table_name
              AND c.column_name = kcu.column_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE 1=1
        AND tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'knowledge-elements_bigint'
      ORDER BY kcu.column_name
        `
    );
    expect(foreignKeysKnowledgeElementsBigintColumns).to.deep.equal([
      {
        referenced_column_name: 'id',
        referenced_table_name: 'answers_bigint',
        referencing_column_name: 'answerId',
      },
      {
        referenced_column_name: 'id',
        referenced_table_name: 'assessments',
        referencing_column_name: 'assessmentId',
      },
      {
        referenced_column_name: 'id',
        referenced_table_name: 'users',
        referencing_column_name: 'userId',
      },
    ]);
  });
  it('should create indexes', async function () {
    // then
    const { rows: indexAnswersBigintColumns } = await knex.raw(
      `SELECT
           a.attname,
           am.amname index_type
        FROM pg_index idx
            INNER JOIN pg_class cls ON cls.oid=idx.indexrelid
            INNER JOIN pg_class tab ON tab.oid=idx.indrelid
            INNER JOIN pg_am am     ON am.oid=cls.relam
            INNER JOIN pg_attribute a ON a.attrelid = cls.oid
        WHERE tab.relname = 'answers_bigint'
        ORDER BY a.attname`
    );
    expect(indexAnswersBigintColumns).to.deep.equal([
      {
        attname: 'assessmentId',
        index_type: 'btree',
      },
      {
        attname: 'id',
        index_type: 'btree',
      },
    ]);

    const { rows: indexKnowledgeElementsBigintColumns } = await knex.raw(
      `SELECT
           a.attname,
           am.amname index_type
        FROM pg_index idx
            INNER JOIN pg_class cls ON cls.oid=idx.indexrelid
            INNER JOIN pg_class tab ON tab.oid=idx.indrelid
            INNER JOIN pg_am am     ON am.oid=cls.relam
            INNER JOIN pg_attribute a ON a.attrelid = cls.oid
        WHERE tab.relname = 'knowledge-elements_bigint'
        ORDER BY a.attname`
    );
    expect(indexKnowledgeElementsBigintColumns).to.deep.equal([
      {
        attname: 'assessmentId',
        index_type: 'btree',
      },
      {
        attname: 'id',
        index_type: 'btree',
      },
      {
        attname: 'userId',
        index_type: 'btree',
      },
    ]);
  });
});
