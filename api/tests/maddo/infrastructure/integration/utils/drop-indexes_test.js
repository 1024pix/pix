import { expect } from 'chai';

import { dropIndexes } from '../../../../../src/maddo/infrastructure/utils/drop-indexes.ts';
import { datamartKnex } from '../../../../tooling/databases.js';

describe('Maddo | Infrastructure | Utils | Integration | drop-indexes', function () {
  const TABLE = 'drop-indexes "test"';
  let pgClient;

  const indexNames = () =>
    datamartKnex('pg_indexes').where({ tablename: TABLE }).orderBy('indexname').pluck('indexname');

  beforeEach(async function () {
    await datamartKnex.schema.dropTableIfExists(TABLE);
    pgClient = await datamartKnex.context.client.acquireConnection();
  });

  afterEach(async function () {
    await datamartKnex.context.client.releaseConnection(pgClient);
    await datamartKnex.schema.dropTableIfExists(TABLE);
  });

  it('should drop the plain indexes and return the statements that rebuild them', async function () {
    // given
    await datamartKnex.schema.createTable(TABLE, (t) => {
      t.string('uai').index('uai_index');
      t.string('lastName');
      t.string('firstName');
      t.index(['lastName', 'firstName'], 'Name Index');
    });
    const definitionsBefore = await datamartKnex('pg_indexes')
      .where({ tablename: TABLE })
      .orderBy('indexname')
      .pluck('indexdef');

    // when
    const definitions = await dropIndexes({ pgClient, table: TABLE });

    // then
    expect(await indexNames()).to.deep.equal([]);
    expect(definitions).to.have.members(definitionsBefore);

    for (const definition of definitions) await pgClient.query(definition);
    expect(await indexNames()).to.deep.equal(['Name Index', 'uai_index']);
  });

  it('should leave the indexes backing a constraint in place', async function () {
    // given
    await datamartKnex.schema.createTable(TABLE, (t) => {
      t.integer('id').primary({ constraintName: 'test_pkey' });
      t.string('code').unique({ indexName: 'test_code_unique' });
      t.string('uai').index('uai_index');
    });

    // when
    const definitions = await dropIndexes({ pgClient, table: TABLE });

    // then
    expect(definitions).to.have.lengthOf(1);
    expect(definitions[0]).to.include('uai_index');
    expect(await indexNames()).to.deep.equal(['test_code_unique', 'test_pkey']);
  });

  it('should return an empty list when the table has no index', async function () {
    // given
    await datamartKnex.schema.createTable(TABLE, (t) => t.string('uai'));

    // when
    const definitions = await dropIndexes({ pgClient, table: TABLE });

    // then
    expect(definitions).to.deep.equal([]);
  });

  it('should restore the indexes when the surrounding transaction is rolled back', async function () {
    // given
    await datamartKnex.schema.createTable(TABLE, (t) => t.string('uai').index('uai_index'));

    // when
    await pgClient.query('BEGIN');
    await dropIndexes({ pgClient, table: TABLE });
    await pgClient.query('ROLLBACK');

    // then
    expect(await indexNames()).to.deep.equal(['uai_index']);
  });
});
