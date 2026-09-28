import { expect } from 'chai';

import { copyFromStdin } from '../../../../../src/maddo/infrastructure/utils/copy-from-stdin.ts';
import { datamartKnex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Maddo | Infrastructure | Utils | Integration | copy-from-stdin', function () {
  const TABLE = 'copy_from_stdin_test';
  let pgClient;

  beforeEach(async function () {
    await datamartKnex.schema.dropTableIfExists(TABLE);
    await datamartKnex.schema.createTable(TABLE, (t) => {
      t.string('last_name').notNullable();
      t.integer('score');
      t.float('ratio');
      t.boolean('is_ok');
      t.date('birthdate');
      t.timestamp('happened_at');
      t.jsonb('configuration');
    });
    pgClient = await datamartKnex.context.client.acquireConnection();
  });

  afterEach(async function () {
    await datamartKnex.context.client.releaseConnection(pgClient);
    await datamartKnex.schema.dropTableIfExists(TABLE);
  });

  it('should insert rows of every supported type, including tricky strings and NULLs', async function () {
    // given
    const columns = ['last_name', 'score', 'ratio', 'is_ok', 'birthdate', 'happened_at', 'configuration'];
    const rows = [
      {
        last_name: 'O"Neil, Jr.\nline2',
        score: 12,
        ratio: 0.5,
        is_ok: true,
        birthdate: '2008-02-29',
        happened_at: new Date('2024-05-06T07:08:09Z'),
        configuration: { scoring: 'v3' },
      },
      {
        last_name: '',
        score: null,
        ratio: null,
        is_ok: false,
        birthdate: null,
        happened_at: null,
        configuration: null,
      },
    ];

    // when
    const copy = copyFromStdin({ pgClient, table: TABLE, columns });
    await copy.writeRow(rows[0]);
    await copy.writeRow(rows[1]);
    const { rowCount } = await copy.end();

    // then
    expect(rowCount).to.equal(2);
    const inserted = await datamartKnex(TABLE).select(columns).orderBy('last_name', 'desc');
    expect(inserted).to.deep.equal([
      {
        last_name: 'O"Neil, Jr.\nline2',
        score: 12,
        ratio: 0.5,
        is_ok: true,
        birthdate: '2008-02-29',
        happened_at: new Date('2024-05-06T07:08:09Z'),
        configuration: { scoring: 'v3' },
      },
      {
        last_name: '',
        score: null,
        ratio: null,
        is_ok: false,
        birthdate: null,
        happened_at: null,
        configuration: null,
      },
    ]);
  });

  it('should handle many rows with backpressure', async function () {
    // given
    const rows = Array.from({ length: 20_000 }, (_, i) => ({ last_name: `name-${i}`.padEnd(200, 'x'), score: i }));

    // when
    const copy = copyFromStdin({ pgClient, table: TABLE, columns: ['last_name', 'score'] });
    for (const row of rows) await copy.writeRow(row);
    const { rowCount } = await copy.end();

    // then
    expect(rowCount).to.equal(20_000);
    const [{ count }] = await datamartKnex(TABLE).count();
    expect(count).to.equal(20_000);
  });

  it('should reject with the PostgreSQL error, insert nothing, and leave the connection usable', async function () {
    // given
    const copy = copyFromStdin({ pgClient, table: TABLE, columns: ['last_name', 'score'] });

    // when
    await copy.writeRow({ last_name: 'ok', score: 1 });
    await copy.writeRow({ last_name: 'ko', score: 'not-a-number' });
    const error = await catchErr(() => copy.end())();

    // then
    expect(error.code).to.equal('22P02');
    expect(error.message).to.include('invalid input syntax for type integer');
    const [{ count }] = await datamartKnex(TABLE).count();
    expect(count).to.equal(0);
    const { rows: ping } = await pgClient.query('SELECT 1 AS ok');
    expect(ping).to.deep.equal([{ ok: 1 }]);
  });

  it('should reject writes when the COPY cannot start', async function () {
    // given
    const copy = copyFromStdin({ pgClient, table: 'no_such_table', columns: ['last_name'] });

    // when
    const error = await catchErr(() => copy.writeRow({ last_name: 'x' }))();

    // then
    expect(error.code).to.equal('42P01');
    await copy.abort();
    const { rows: ping } = await pgClient.query('SELECT 1 AS ok');
    expect(ping).to.deep.equal([{ ok: 1 }]);
  });

  describe('#abort', function () {
    it('should discard the rows already sent and leave the connection usable', async function () {
      // given
      const copy = copyFromStdin({ pgClient, table: TABLE, columns: ['last_name', 'score'] });
      await copy.writeRow({ last_name: 'to-be-discarded', score: 1 });

      // when
      await copy.abort('source stream failed');

      // then
      const [{ count }] = await datamartKnex(TABLE).count();
      expect(count).to.equal(0);
      const { rows: ping } = await pgClient.query('SELECT 1 AS ok');
      expect(ping).to.deep.equal([{ ok: 1 }]);
    });
  });
});
