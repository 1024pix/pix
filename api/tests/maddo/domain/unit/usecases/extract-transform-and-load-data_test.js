import { expect } from 'chai';
import sinon from 'sinon';

import { extractTransformAndLoadData } from '../../../../../src/maddo/domain/usecases/extract-transform-and-load-data.ts';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Maddo | Domain | Usecases | Unit | extract-transform-and-load-data', function () {
  const rows = [
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
    { id: 3, name: 'c' },
  ];
  let replications;
  let sourceQueryBuilder;
  let targetQueryBuilder;
  let copy;
  let copyFromStdin;
  let pgClient;
  let datamartKnex;
  let datawarehouseKnex;

  const streamOf = (rows) => ({
    async *stream() {
      yield* rows;
    },
  });

  beforeEach(function () {
    replications = { foo: { source: 'source_table', target: 'target_table', columns: ['id', 'name'] } };
    sourceQueryBuilder = { select: sinon.stub().returns(streamOf(rows)) };
    datawarehouseKnex = sinon.stub().withArgs('source_table').returns(sourceQueryBuilder);
    targetQueryBuilder = { truncate: sinon.stub().resolves() };
    pgClient = Symbol('pgClient');
    datamartKnex = sinon.stub().withArgs('target_table').returns(targetQueryBuilder);
    datamartKnex.context = {
      client: {
        acquireConnection: sinon.stub().resolves(pgClient),
        releaseConnection: sinon.stub(),
      },
    };
    copy = {
      writeRow: sinon.stub().resolves(),
      end: sinon.stub().resolves({ rowCount: 3 }),
      abort: sinon.stub().resolves(),
    };
    copyFromStdin = sinon.stub().returns(copy);
  });

  const run = (replicationName = 'foo') =>
    extractTransformAndLoadData({ replicationName, datamartKnex, datawarehouseKnex, replications, copyFromStdin });

  it('should truncate the target, then COPY the selected source columns into it and return the server row count', async function () {
    // when
    const result = await run();

    // then
    expect(result).to.deep.equal({ count: 3 });
    expect(targetQueryBuilder.truncate).to.have.been.calledOnce;
    expect(targetQueryBuilder.truncate).to.have.been.calledBefore(copyFromStdin);
    expect(copyFromStdin).to.have.been.calledOnceWithExactly({
      pgClient,
      table: 'target_table',
      columns: ['id', 'name'],
    });
    expect(sourceQueryBuilder.select).to.have.been.calledOnceWithExactly(['id', 'name']);
    expect(copy.writeRow).to.have.been.calledThrice;
    expect(copy.writeRow.args.map(([row]) => row)).to.deep.equal(rows);
    expect(copy.end).to.have.been.calledOnce;
    expect(copy.writeRow).to.have.been.calledBefore(copy.end);
    expect(copy.abort).to.not.have.been.called;
    expect(datamartKnex.context.client.releaseConnection).to.have.been.calledOnceWithExactly(pgClient);
  });

  describe('when columns are a { target: source } mapping', function () {
    it('should select with the mapping and COPY into the target column names', async function () {
      // given
      replications.foo.columns = { identifier: 'id', label: 'name' };

      // when
      await run();

      // then
      expect(sourceQueryBuilder.select).to.have.been.calledOnceWithExactly({ identifier: 'id', label: 'name' });
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
      sourceQueryBuilder.select.returns(streamOf([]));
      copy.end.resolves({ rowCount: 0 });

      // when
      const result = await run();

      // then
      expect(result).to.deep.equal({ count: 0 });
      expect(copy.writeRow).to.not.have.been.called;
      expect(copy.end).to.have.been.calledOnce;
      expect(datamartKnex.context.client.releaseConnection).to.have.been.calledOnceWithExactly(pgClient);
    });
  });

  describe('when the replication is unknown', function () {
    it('should throw before touching any database', async function () {
      // when
      const error = await catchErr(run)('nope');

      // then
      expect(error.message).to.equal('Unknown replication "nope".');
      expect(datamartKnex).to.not.have.been.called;
      expect(datamartKnex.context.client.acquireConnection).to.not.have.been.called;
    });
  });

  describe('when the source stream fails', function () {
    it('should abort the COPY, release the pgClient and rethrow', async function () {
      // given
      const streamError = new Error('datawarehouse went away');
      sourceQueryBuilder.select.returns({
        async *stream() {
          yield { id: 1, name: 'a' };
          throw streamError;
        },
      });

      // when
      const error = await catchErr(run)();

      // then
      expect(error).to.equal(streamError);
      expect(copy.abort).to.have.been.calledOnceWithExactly('replication "foo" failed');
      expect(copy.end).to.not.have.been.called;
      expect(datamartKnex.context.client.releaseConnection).to.have.been.calledOnceWithExactly(pgClient);
    });
  });

  describe('when the COPY fails', function () {
    it('should release the pgClient and rethrow the database error', async function () {
      // given
      const databaseError = new Error('invalid input syntax for type integer');
      copy.end.rejects(databaseError);

      // when
      const error = await catchErr(run)();

      // then
      expect(error).to.equal(databaseError);
      expect(datamartKnex.context.client.releaseConnection).to.have.been.calledOnceWithExactly(pgClient);
    });
  });
});
