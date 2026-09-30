import { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setImmediate } from 'node:timers/promises';

import { expect } from 'chai';

import { COPY_FRAME_BYTES, copyToStdout } from '../../../../../src/maddo/infrastructure/utils/copy-to-stdout.ts';
import { datawarehouseKnex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Maddo | Infrastructure | Utils | Integration | copy-to-stdout', function () {
  const TABLE = 'copy_to_stdout_test';
  let pgClient;

  beforeEach(async function () {
    await datawarehouseKnex.schema.dropTableIfExists(TABLE);
    await datawarehouseKnex.schema.createTable(TABLE, (t) => {
      t.string('last_name');
      t.integer('score');
      t.date('birthdate');
      t.jsonb('configuration');
    });
    pgClient = await datawarehouseKnex.context.client.acquireConnection();
  });

  afterEach(async function () {
    await datawarehouseKnex.context.client.releaseConnection(pgClient);
    await datawarehouseKnex.schema.dropTableIfExists(TABLE);
  });

  const collector = (frames, { slow = false } = {}) =>
    new Writable({
      write: (frame, _encoding, callback) => {
        frames.push(frame);
        if (slow) setImmediate().then(() => callback());
        else callback();
      },
    });

  it('should stream the selected columns as PostgreSQL CSV, with NULLs as empty fields', async function () {
    // given
    await datawarehouseKnex(TABLE).insert([
      { last_name: 'O"Neil, Jr.\nline2', score: 12, birthdate: '2008-02-29', configuration: { scoring: 'v3' } },
      { last_name: '', score: null, birthdate: null, configuration: null },
    ]);
    const frames = [];

    // when
    const copy = copyToStdout({
      pgClient,
      table: TABLE,
      columns: ['last_name', 'score', 'birthdate', 'configuration'],
    });
    await pipeline(copy, collector(frames));

    // then
    expect(Buffer.concat(frames).toString()).to.equal(
      '"O""Neil, Jr.\nline2",12,2008-02-29,"{""scoring"": ""v3""}"\n' + '"",,,\n',
    );
  });

  it('should stream many rows in bounded frames to a slow consumer', async function () {
    // given
    const rows = Array.from({ length: 20_000 }, (_, i) => ({ last_name: `name-${i}`.padEnd(200, 'x'), score: i }));
    await datawarehouseKnex.batchInsert(TABLE, rows);
    const frames = [];

    // when
    const copy = copyToStdout({ pgClient, table: TABLE, columns: ['last_name', 'score'] });
    await pipeline(copy, collector(frames, { slow: true }));

    // then
    const csv = Buffer.concat(frames).toString();
    expect(csv.split('\n')).to.have.lengthOf(20_001); // one trailing newline
    expect(frames.length).to.be.greaterThan(1);
    for (const frame of frames) expect(frame.length).to.be.at.most(COPY_FRAME_BYTES);
  });

  it('should reject with the PostgreSQL error and leave the connection usable when the COPY cannot start', async function () {
    // given
    const copy = copyToStdout({ pgClient, table: 'no_such_table', columns: ['last_name'] });

    // when
    const error = await catchErr(() => pipeline(copy, collector([])))();

    // then
    expect(error.code).to.equal('42P01');
    const { rows: ping } = await pgClient.query('SELECT 1 AS ok');
    expect(ping).to.deep.equal([{ ok: 1 }]);
  });

  describe('when the consumer fails', function () {
    it('should reject with the consumer error and leave the connection usable', async function () {
      // given
      const rows = Array.from({ length: 20_000 }, (_, i) => ({ last_name: `name-${i}`.padEnd(200, 'x'), score: i }));
      await datawarehouseKnex.batchInsert(TABLE, rows);
      const consumerError = new Error('target failed');
      const failingConsumer = new Writable({ write: (_frame, _encoding, callback) => callback(consumerError) });

      // when
      const copy = copyToStdout({ pgClient, table: TABLE, columns: ['last_name', 'score'] });
      const error = await catchErr(() => pipeline(copy, failingConsumer))();

      // then
      expect(error).to.equal(consumerError);
      const { rows: ping } = await pgClient.query('SELECT 1 AS ok');
      expect(ping).to.deep.equal([{ ok: 1 }]);
    });
  });
});
