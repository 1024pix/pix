import { Readable } from 'node:stream';

import { expect } from 'chai';
import sinon from 'sinon';

import { extractTransformAndLoadData } from '../../../../../src/maddo/domain/usecases/extract-transform-and-load-data.ts';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Maddo | Domain | Usecases | Unit | extract-transform-and-load-data', function () {
  const frames = [Buffer.from('1,a\n2,b\n'), Buffer.from('3,c\n')];
  const indexDefinitions = [
    'CREATE INDEX target_table_id_index ON public.target_table USING btree (id)',
    'CREATE INDEX target_table_name_index ON public.target_table USING btree (name)',
  ];
  let replications;
  let copyOut;
  let copyToStdout;
  let copy;
  let copyFromStdin;
  let sourcePgClient;
  let dropIndexes;
  let pgClient;
  let datamartKnex;
  let datawarehouseKnex;

  const pool = (pgClient) => ({
    context: {
      client: {
        acquireConnection: sinon.stub().resolves(pgClient),
        releaseConnection: sinon.stub(),
      },
    },
  });
  const sourceSends = (chunks) => {
    copyOut = Readable.from(chunks, { objectMode: false });
    copyToStdout.returns(copyOut);
  };

  beforeEach(function () {
    replications = { foo: { source: 'source_table', target: 'target_table', columns: ['id', 'name'] } };
    sourcePgClient = Symbol('sourcePgClient');
    datawarehouseKnex = pool(sourcePgClient);
    pgClient = { query: sinon.stub().resolves() };
    datamartKnex = pool(pgClient);
    copyToStdout = sinon.stub();
    sourceSends(frames);
    copy = {
      write: sinon.stub().resolves(),
      end: sinon.stub().resolves({ rowCount: 3 }),
      abort: sinon.stub().resolves(),
    };
    copyFromStdin = sinon.stub().returns(copy);
    dropIndexes = sinon.stub().resolves(indexDefinitions);
  });

  const run = (replicationName = 'foo') =>
    extractTransformAndLoadData({
      replicationName,
      datamartKnex,
      datawarehouseKnex,
      replications,
      copyFromStdin,
      copyToStdout,
      dropIndexes,
    });

  const statements = () => pgClient.query.args.map(([text]) => text);

  const expectConnectionsReleased = () => {
    expect(copyOut.closed).to.be.true;
    expect(datawarehouseKnex.context.client.releaseConnection).to.have.been.calledOnceWithExactly(sourcePgClient);
    expect(datamartKnex.context.client.releaseConnection).to.have.been.calledOnceWithExactly(pgClient);
  };

  it('should pipe a COPY of the selected source columns into a COPY of the target and return the server row count', async function () {
    // when
    const result = await run();

    // then
    expect(result).to.deep.equal({ count: 3 });
    expect(copyToStdout).to.have.been.calledOnceWithExactly({
      pgClient: sourcePgClient,
      table: 'source_table',
      columns: ['id', 'name'],
    });
    expect(copyFromStdin).to.have.been.calledOnceWithExactly({
      pgClient,
      table: 'target_table',
      columns: ['id', 'name'],
    });
    expect(copy.write.args.map(([frame]) => frame)).to.deep.equal(frames);
    expect(copy.end).to.have.been.calledOnce;
    expect(copy.write).to.have.been.calledBefore(copy.end);
    expect(copy.abort).to.not.have.been.called;
    expectConnectionsReleased();
  });

  it('should drop the target indexes before the load and rebuild them after, in a single transaction', async function () {
    // when
    await run();

    // then
    expect(statements()).to.deep.equal([
      'BEGIN',
      'TRUNCATE "target_table" RESTART IDENTITY',
      ...indexDefinitions,
      'COMMIT',
    ]);
    expect(dropIndexes).to.have.been.calledOnceWithExactly({ pgClient, table: 'target_table' });
    const [begin, truncate, firstIndex, , commit] = pgClient.query.getCalls();
    expect(begin).to.have.been.calledBefore(dropIndexes.firstCall);
    expect(dropIndexes).to.have.been.calledBefore(truncate);
    expect(truncate).to.have.been.calledBefore(copyFromStdin.firstCall);
    expect(copy.end).to.have.been.calledBefore(firstIndex);
    expect(commit).to.have.been.calledBefore(datamartKnex.context.client.releaseConnection.firstCall);
  });

  describe('when columns are a { target: source } mapping', function () {
    it('should COPY the source column names into the target column names', async function () {
      // given
      replications.foo.columns = { identifier: 'id', label: 'name' };

      // when
      await run();

      // then
      expect(copyToStdout).to.have.been.calledOnceWithExactly({
        pgClient: sourcePgClient,
        table: 'source_table',
        columns: ['id', 'name'],
      });
      expect(copyFromStdin).to.have.been.calledOnceWithExactly({
        pgClient,
        table: 'target_table',
        columns: ['identifier', 'label'],
      });
    });
  });

  describe('when the source is empty', function () {
    it('should end an empty COPY and return a zero count', async function () {
      // given
      sourceSends([]);
      copy.end.resolves({ rowCount: 0 });

      // when
      const result = await run();

      // then
      expect(result).to.deep.equal({ count: 0 });
      expect(copy.write).to.not.have.been.called;
      expect(copy.end).to.have.been.calledOnce;
      expect(statements().at(-1)).to.equal('COMMIT');
      expect(datamartKnex.context.client.releaseConnection).to.have.been.calledOnceWithExactly(pgClient);
    });
  });

  describe('when the replication is unknown', function () {
    it('should throw before touching any database', async function () {
      // when
      const error = await catchErr(run)('nope');

      // then
      expect(error.message).to.equal('Unknown replication "nope".');
      expect(datawarehouseKnex.context.client.acquireConnection).to.not.have.been.called;
      expect(datamartKnex.context.client.acquireConnection).to.not.have.been.called;
    });
  });

  describe('when the source stream fails', function () {
    it('should abort the COPY, roll back, release both connections and rethrow', async function () {
      // given
      const streamError = new Error('datawarehouse went away');
      sourceSends(
        (async function* () {
          yield frames[0];
          throw streamError;
        })(),
      );

      // when
      const error = await catchErr(run)();

      // then
      expect(error).to.equal(streamError);
      expect(copy.abort).to.have.been.calledOnceWithExactly('replication "foo" failed');
      expect(copy.end).to.not.have.been.called;
      expect(statements()).to.deep.equal(['BEGIN', 'TRUNCATE "target_table" RESTART IDENTITY', 'ROLLBACK']);
      expectConnectionsReleased();
    });
  });

  describe('when the COPY fails', function () {
    it('should roll back, release both connections and rethrow the database error', async function () {
      // given
      const databaseError = new Error('invalid input syntax for type integer');
      copy.end.rejects(databaseError);

      // when
      const error = await catchErr(run)();

      // then
      expect(error).to.equal(databaseError);
      expect(statements()).to.deep.equal(['BEGIN', 'TRUNCATE "target_table" RESTART IDENTITY', 'ROLLBACK']);
      expectConnectionsReleased();
    });
  });

  describe('when writing to the target fails before the source is exhausted', function () {
    it('should stop reading the source, abort the COPY, roll back and rethrow', async function () {
      // given
      const databaseError = new Error('null value violates not-null constraint');
      copy.write.rejects(databaseError);

      // when
      const error = await catchErr(run)();

      // then
      expect(error).to.equal(databaseError);
      expect(copy.write).to.have.been.calledOnce;
      expect(copy.end).to.not.have.been.called;
      expect(copy.abort).to.have.been.calledOnce;
      expect(statements().at(-1)).to.equal('ROLLBACK');
      expectConnectionsReleased();
    });
  });

  describe('when rebuilding an index fails', function () {
    it('should roll back instead of committing, release the pgClient and rethrow', async function () {
      // given
      const indexError = new Error('could not create index');
      pgClient.query.withArgs(indexDefinitions[1]).rejects(indexError);

      // when
      const error = await catchErr(run)();

      // then
      expect(error).to.equal(indexError);
      expect(statements()).to.not.include('COMMIT');
      expect(statements().at(-1)).to.equal('ROLLBACK');
      expect(datamartKnex.context.client.releaseConnection).to.have.been.calledOnceWithExactly(pgClient);
    });
  });

  describe('when the rollback fails too', function () {
    it('should still release the pgClient and rethrow the original error', async function () {
      // given
      const databaseError = new Error('connection terminated');
      copy.end.rejects(databaseError);
      pgClient.query.withArgs('ROLLBACK').rejects(new Error('rollback failed'));

      // when
      const error = await catchErr(run)();

      // then
      expect(error).to.equal(databaseError);
      expect(datamartKnex.context.client.releaseConnection).to.have.been.calledOnceWithExactly(pgClient);
    });
  });
});
