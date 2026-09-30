import { EventEmitter } from 'node:events';
import { setImmediate } from 'node:timers/promises';

import { expect } from 'chai';
import sinon from 'sinon';

import { copyFromStdin } from '../../../../../src/maddo/infrastructure/utils/copy-from-stdin.ts';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Maddo | Infrastructure | Utils | Unit | copy-from-stdin', function () {
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

  describe('writing', function () {
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

    it('should push each chunk to the socket as it is', async function () {
      // given
      const copy = wire();
      const chunk = Buffer.from('1,"a"\n2,"b"\n');

      // when
      await copy.write(chunk);

      // then
      expect(connection.sendCopyFromChunk).to.have.been.calledOnce;
      expect(connection.sendCopyFromChunk.firstCall.args[0]).to.equal(chunk);
    });

    it('should end the COPY after the last chunk and return the row count reported by the server', async function () {
      // given
      const copy = wire();
      await copy.write(Buffer.from('1,"a"\n2,"b"\n'));

      // when
      const ending = copy.end();
      submitted.handleCommandComplete({ text: 'COPY 2' });
      submitted.handleReadyForQuery();
      const { rowCount } = await ending;

      // then
      expect(rowCount).to.equal(2);
      expect(connection.endCopyFrom).to.have.been.calledOnce;
      expect(connection.sendCopyFromChunk).to.have.been.calledBefore(connection.endCopyFrom);
    });

    it('should wait for the socket to drain before accepting more when it is saturated', async function () {
      // given
      const copy = wire();
      connection.stream = new EventEmitter();
      connection.stream.writableNeedDrain = true;
      const settled = sinon.stub();

      // when
      const writing = copy.write(Buffer.from('1,"a"\n')).then(settled);
      await setImmediate();
      expect(settled).to.not.have.been.called;
      connection.stream.emit('drain');
      await writing;

      // then
      expect(settled).to.have.been.calledOnce;
    });

    it('should reject writes and skip CopyFail once the server reported an error', async function () {
      // given
      const copy = wire();
      const serverError = new Error('invalid input syntax for type integer');
      submitted.handleError(serverError);

      // when
      const error = await catchErr(copy.write)(Buffer.from('x\n'));
      await copy.abort('whatever');

      // then
      expect(error).to.equal(serverError);
      expect(connection.sendCopyFromChunk).to.not.have.been.called;
      expect(connection.sendCopyFail).to.not.have.been.called;
    });
  });
});
