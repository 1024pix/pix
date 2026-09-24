import { expect } from 'chai';
import sinon from 'sinon';

import { copyFromStdin, encodeCsvLine } from '../../../../../src/maddo/infrastructure/utils/copy-from-stdin.ts';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Maddo | Infrastructure | Utils | Unit | copy-from-stdin', function () {
  describe('#encodeCsvLine', function () {
    it('should quote every non-null value and end the line with a newline', function () {
      expect(encodeCsvLine(['Dupont', 42, 3.5, true])).to.equal('"Dupont","42","3.5","true"\n');
    });

    it('should encode null and undefined as an empty unquoted field (NULL for PostgreSQL)', function () {
      expect(encodeCsvLine([null, undefined, ''])).to.equal(',,""\n');
    });

    it('should escape quotes, and keep separators and newlines inside quotes', function () {
      expect(encodeCsvLine(['O"Neil', 'a,b', 'line1\nline2'])).to.equal('"O""Neil","a,b","line1\nline2"\n');
    });

    it('should encode dates as ISO 8601 and objects as JSON', function () {
      const line = encodeCsvLine([new Date('2024-05-06T07:08:09Z'), { scoring: 'v3', levels: [1, 2] }]);
      expect(line).to.equal('"2024-05-06T07:08:09.000Z","{""scoring"":""v3"",""levels"":[1,2]}"\n');
    });
  });

  describe('#copyFromStdin', function () {
    it('should submit a COPY FROM STDIN statement with quoted identifiers to the pg client', function () {
      // given
      const pgClient = { query: sinon.stub() };

      // when
      const copy = copyFromStdin({
        pgClient,
        table: 'sco_certification_results',
        columns: ['last_name', 'weird"col'],
      });

      // then
      const expectedText = 'COPY "sco_certification_results" ("last_name", "weird""col") FROM STDIN WITH (FORMAT csv)';
      expect(copy.text).to.equal(expectedText);
      expect(pgClient.query).to.have.been.calledOnce;
      const submitted = pgClient.query.firstCall.args[0];
      expect(submitted.text).to.equal(expectedText);
      expect(submitted.submit).to.be.a('function');
    });

    it('should refuse an empty column list', function () {
      const pgClient = { query: sinon.stub() };

      expect(() => copyFromStdin({ pgClient, table: 't', columns: [] })).to.throw('at least one column');
      expect(pgClient.query).to.not.have.been.called;
    });
  });

  describe('buffering', function () {
    const columns = ['id', 'payload'];
    let connection;
    let pgClient;
    let submitted;

    const wire = () => {
      connection = {
        query: sinon.stub(),
        sendCopyFromChunk: sinon.stub(),
        endCopyFrom: sinon.stub(),
        sendCopyFail: sinon.stub(),
        stream: { writableNeedDrain: false },
      };
      pgClient = { connection, query: sinon.stub().callsFake((query) => (submitted = query)) };
      const copy = copyFromStdin({ pgClient, table: 't', columns });
      submitted.handleCopyInResponse();
      return copy;
    };

    it('should push a chunk to the socket once 512 KiB of CSV are buffered, then the remainder on end', async function () {
      // given
      const copy = wire();
      const row = { id: 1, payload: 'x'.repeat(1000) }; // one line is a bit more than 1 KB

      // when
      for (let i = 0; i < 1500; i++) await copy.writeRow(row);
      expect(connection.sendCopyFromChunk).to.have.been.calledTwice; // 1500 KB -> 2 full chunks of ≥ 512 KiB
      const ending = copy.end();
      submitted.handleCommandComplete({ text: 'COPY 1500' });
      submitted.handleReadyForQuery();
      const { rowCount } = await ending;

      // then
      expect(rowCount).to.equal(1500);
      expect(connection.sendCopyFromChunk).to.have.been.calledThrice;
      const sizes = connection.sendCopyFromChunk.args.map(([chunk]) => chunk.length);
      expect(sizes[0]).to.be.at.least(512 * 1024);
      expect(sizes[1]).to.be.at.least(512 * 1024);
      expect(sizes.reduce((a, b) => a + b, 0)).to.equal(1500 * Buffer.byteLength('"1","' + 'x'.repeat(1000) + '"\n'));
      expect(connection.endCopyFrom).to.have.been.calledOnce;
      expect(connection.sendCopyFromChunk).to.have.been.calledBefore(connection.endCopyFrom);
    });

    it('should count bytes, not characters, so accented text flushes at the right size', async function () {
      // given
      const copy = wire();
      const row = { id: 1, payload: 'é'.repeat(1000) }; // 1000 characters but 2000 UTF-8 bytes

      // when
      for (let i = 0; i < 300; i++) await copy.writeRow(row); // ~600 KB of bytes, ~300 K characters

      // then
      expect(connection.sendCopyFromChunk).to.have.been.calledOnce;
    });

    it('should fail fast and skip CopyFail once the server reported an error', async function () {
      // given
      const copy = wire();
      const serverError = new Error('invalid input syntax');
      submitted.handleError(serverError);

      // when
      const error = await catchErr(() => copy.writeRow({ id: 1, payload: 'x' }))();
      await copy.abort('whatever');

      // then
      expect(error).to.equal(serverError);
      expect(connection.sendCopyFail).to.not.have.been.called;
    });
  });
});
