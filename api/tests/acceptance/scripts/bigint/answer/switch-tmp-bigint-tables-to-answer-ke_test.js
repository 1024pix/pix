const {
  createAnswersBigintMigrationDatabaseStructures,
} = require('../../../../../scripts/bigint/answer/create-migration-database-structure');
const {
  copyAnswerKeDataToTemporaryTables,
} = require('../../../../../scripts/bigint/answer/copy-answers-ke-data-to-temporary-tables-with-bigint');
const {
  addConstraintsAndIndexesToAnswersKeBigintTemporaryTables,
} = require('../../../../../scripts/bigint/answer/add-constraints-and-indexes-to-answers-ke-temporary-tables-with-bigint');
const {
  copyNewlyInsertedRowsToAnswerIdTmpBigintTables,
} = require('../../../../../scripts/bigint/answer/copy-newly-inserted-rows-to-answerId-tmp-bigint-tables');
const {
  copyAnswerKeDataInsertedBeforeTrigger,
} = require('../../../../../scripts/bigint/answer/copy-answers-ke-data-inserted-before-trigger-to-tmp-bigint-tables');
const {
  switchTmpBigintTablesToAnswerKeTables,
} = require('../../../../../scripts/bigint/answer/switch-tmp-bigint-tables-to-answer-ke');

const { expect, knex } = require('../../../../test-helper');

const DatabaseBuilder = require('../../../../../db/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

describe('#switchTmpBigintTablesToAnswerKeTables', function () {
  let answerIdInsertedBeforeSwitch;

  beforeEach(async function () {
    // given
    await knex.raw('DROP TABLE IF EXISTS "bigint-migration-settings"');
    await knex.raw('DROP TABLE IF EXISTS "knowledge-elements_bigint"');
    await knex.raw('DROP TABLE IF EXISTS "answers_bigint"');
    await knex.raw('DROP TRIGGER IF EXISTS trg_answers ON answers');
    await knex.raw('DROP TRIGGER IF EXISTS "trg_knowledge-elements" ON "knowledge-elements"');

    await createAnswersBigintMigrationDatabaseStructures(knex);
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
    const { id: firstAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId: firstAnswerId });
    const { id: secondAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId: secondAnswerId });

    await databaseBuilder.commit();
    await copyAnswerKeDataToTemporaryTables();
    await addConstraintsAndIndexesToAnswersKeBigintTemporaryTables();

    const { id: assessmentId2 } = databaseBuilder.factory.buildAssessment();
    const { id: firstAnswerId2 } = databaseBuilder.factory.buildAnswer({ assessmentId: assessmentId2 });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId: assessmentId2, answerId: firstAnswerId2 });
    const { id: secondAnswerId2 } = databaseBuilder.factory.buildAnswer({ assessmentId: assessmentId2 });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId: assessmentId2, answerId: secondAnswerId2 });

    await databaseBuilder.commit();

    await copyNewlyInsertedRowsToAnswerIdTmpBigintTables();

    const { id: assessmentId3 } = databaseBuilder.factory.buildAssessment();
    const { id: firstAnswerId3 } = databaseBuilder.factory.buildAnswer({ assessmentId3 });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId: assessmentId3, answerId: firstAnswerId3 });
    const { id: secondAnswerId3 } = databaseBuilder.factory.buildAnswer({ assessmentId3 });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId: assessmentId3, answerId: secondAnswerId3 });
    await databaseBuilder.commit();
    await copyAnswerKeDataInsertedBeforeTrigger();

    [answerIdInsertedBeforeSwitch] = await knex('answers')
      .insert({
        value: 'Some value for answer',
        result: 'Some result for answer',
        challengeId: 'rec123ABC',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
        resultDetails: 'Some result details for answer.',
        timeSpent: 30,
      })
      .returning('id');
    // when
    await switchTmpBigintTablesToAnswerKeTables();
  });

  it('should drop answers and KE triggers', async function () {
    // then
    const { rows: triggersByTable } = await knex.raw(
      `SELECT  event_object_table AS table_name ,trigger_name
             FROM information_schema.triggers
             GROUP BY table_name , trigger_name
             ORDER BY table_name ,trigger_name
            `
    );
    expect(triggersByTable).to.be.empty;
  });

  describe('should mention base table name (instead of temporary table name)', function () {
    it('in PK constraints', async function () {
      // then
      const { rows: primaryKeyAnswersBigintColumn } = await knex.raw(
        `SELECT ccu.column_name, ccu.constraint_name
       FROM pg_constraint pgc
        JOIN pg_namespace nsp ON nsp.oid = pgc.connamespace
        JOIN pg_class  cls     ON pgc.conrelid = cls.oid
        JOIN information_schema.constraint_column_usage ccu ON pgc.conname = ccu.constraint_name AND nsp.nspname = ccu.constraint_schema
        WHERE pgc.contype = 'p' AND ccu.table_name = 'answers'`
      );
      expect(primaryKeyAnswersBigintColumn).to.deep.equal([{ column_name: 'id', constraint_name: 'answers_pkey' }]);

      const { rows: primaryKeyKnowledgeElementsBigintColumn } = await knex.raw(
        `SELECT ccu.column_name, ccu.constraint_name
       FROM pg_constraint pgc
        JOIN pg_namespace nsp ON nsp.oid = pgc.connamespace
        JOIN pg_class  cls     ON pgc.conrelid = cls.oid
        JOIN information_schema.constraint_column_usage ccu ON pgc.conname = ccu.constraint_name AND nsp.nspname = ccu.constraint_schema
        WHERE pgc.contype = 'p' AND ccu.table_name = 'knowledge-elements'`
      );
      expect(primaryKeyKnowledgeElementsBigintColumn).to.deep.equal([
        { column_name: 'id', constraint_name: 'knowledge-elements_pkey' },
      ]);
    });

    it('in FK constraints', async function () {
      // then
      const { rows: foreignKeysAnswersBigintColumns } = await knex.raw(
        `SELECT
          kcu.column_name  AS referencing_column_name,
          ccu.table_name   AS referenced_table_name,
          ccu.column_name  AS referenced_column_name,
          ccu.constraint_name AS constraint_name
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
        AND tc.table_name = 'answers'
      ORDER BY kcu.column_name
        `
      );
      expect(foreignKeysAnswersBigintColumns).to.deep.equal([
        {
          referenced_column_name: 'id',
          referenced_table_name: 'assessments',
          referencing_column_name: 'assessmentId',
          constraint_name: 'answers_assessmentid_foreign',
        },
      ]);

      const { rows: foreignKeysKnowledgeElementsBigintColumns } = await knex.raw(
        `SELECT
          kcu.column_name  AS referencing_column_name,
          ccu.table_name   AS referenced_table_name,
          ccu.column_name  AS referenced_column_name,
          ccu.constraint_name AS constraint_name
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
        AND tc.table_name = 'knowledge-elements'
      ORDER BY kcu.column_name
        `
      );
      expect(foreignKeysKnowledgeElementsBigintColumns).to.deep.equal([
        {
          referenced_column_name: 'id',
          referenced_table_name: 'answers',
          referencing_column_name: 'answerId',
          constraint_name: 'knowledge_elements_answerid_foreign',
        },
        {
          referenced_column_name: 'id',
          referenced_table_name: 'assessments',
          referencing_column_name: 'assessmentId',
          constraint_name: 'knowledge_elements_assessmentid_foreign',
        },
        {
          referenced_column_name: 'id',
          referenced_table_name: 'users',
          referencing_column_name: 'userId',
          constraint_name: 'knowledge_elements_userid_foreign',
        },
      ]);
    });

    it('in indexes', async function () {
      // then
      const { rows: indexAnswersBigintColumns } = await knex.raw(
        `SELECT
           cls.relname,
           a.attname,
           am.amname index_type
        FROM pg_index idx
            INNER JOIN pg_class cls ON cls.oid=idx.indexrelid
            INNER JOIN pg_class tab ON tab.oid=idx.indrelid
            INNER JOIN pg_am am     ON am.oid=cls.relam
            INNER JOIN pg_attribute a ON a.attrelid = cls.oid
        WHERE tab.relname = 'answers'
        ORDER BY a.attname`
      );
      expect(indexAnswersBigintColumns).to.deep.equal([
        {
          attname: 'assessmentId',
          index_type: 'btree',
          relname: 'answers_assessmentid_index',
        },
        {
          attname: 'id',
          index_type: 'btree',
          relname: 'answers_pkey',
        },
      ]);

      const { rows: indexKnowledgeElementsBigintColumns } = await knex.raw(
        `SELECT
           cls.relname,
           a.attname,
           am.amname index_type
        FROM pg_index idx
            INNER JOIN pg_class cls ON cls.oid=idx.indexrelid
            INNER JOIN pg_class tab ON tab.oid=idx.indrelid
            INNER JOIN pg_am am     ON am.oid=cls.relam
            INNER JOIN pg_attribute a ON a.attrelid = cls.oid
        WHERE tab.relname = 'knowledge-elements'
        ORDER BY a.attname`
      );
      expect(indexKnowledgeElementsBigintColumns).to.deep.equal([
        {
          attname: 'assessmentId',
          index_type: 'btree',
          relname: 'knowledge_elements_assessmentid_index',
        },
        {
          attname: 'id',
          index_type: 'btree',
          relname: 'knowledge-elements_pkey',
        },
        {
          attname: 'userId',
          index_type: 'btree',
          relname: 'knowledge_elements_userid_index',
        },
      ]);
    });
  });

  it('should insert answer with an id bigger than the maximum integer type value', async function () {
    // when
    const maxValueBigIntType = '9223372036854775807';
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
    const { id: answerId } = databaseBuilder.factory.buildAnswer({ id: maxValueBigIntType, assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId });
    await databaseBuilder.commit();

    // then
    expect(answerId).to.be.equal(maxValueBigIntType);
  });

  it('should change type of answer sequence from integer to bigint', async function () {
    // then
    const { rows: sequenceDataType } = await knex.raw(
      `SELECT data_type FROM information_schema.sequences WHERE sequence_name = 'answers_id_seq'`
    );
    expect(sequenceDataType[0]['data_type']).to.equal('bigint');
  });

  it('should sequence are correctly reassigned', async function () {
    // when
    const [answerIdInsertedAfterSwitch] = await knex('answers')
      .insert({
        value: 'Some value for answer',
        result: 'Some result for answer',
        challengeId: 'rec123ABC',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
        resultDetails: 'Some result details for answer.',
        timeSpent: 30,
      })
      .returning('id');

    // then
    expect(answerIdInsertedAfterSwitch).to.equal(answerIdInsertedBeforeSwitch + 1);
  });

  afterEach(async function () {
    await knex('knowledge-elements').delete();
    await knex('answers').delete();
    await knex('assessments').delete();
    await knex.raw('DROP TRIGGER IF EXISTS trg_answers ON answers');
    await knex.raw('DROP TRIGGER IF EXISTS "trg_knowledge-elements" ON "knowledge-elements"');
  });
});
