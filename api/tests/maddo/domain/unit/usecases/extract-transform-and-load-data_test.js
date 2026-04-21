import sinon from 'sinon';

import { extractTransformAndLoadData } from '../../../../../src/maddo/domain/usecases/extract-transform-and-load-data.js';

describe('Maddo | Domain | Usecases | Unit | extract-transform-and-load-data', function () {
  let replicationRepository;
  let fromQueryBuilder;
  let fromFunction;

  let toQueryBuilder;
  let toFunction;

  let connection;

  let datamartKnex;
  let datawarehouseKnex;

  beforeEach(function () {
    replicationRepository = {
      getByName: sinon.stub(),
    };
    fromQueryBuilder = {
      async *stream() {
        for (let i = 0; i < 5; i++) {
          yield i;
        }
      },
    };
    fromFunction = sinon.stub().returns(fromQueryBuilder);
    toQueryBuilder = {
      connection: sinon.stub().resolves(),
    };
    toFunction = sinon.stub().returns(toQueryBuilder);
    connection = Symbol('connection');
    datamartKnex = {
      context: {
        client: {
          acquireConnection: sinon.stub().resolves(connection),
          releaseConnection: sinon.stub(),
        },
      },
    };
    datawarehouseKnex = Symbol('datawarehouseKnex');
  });

  it('should insert into database with given query', async function () {
    // given
    const replicationName = 'foo';
    const replication = {
      from: fromFunction,
      to: toFunction,
      chunkSize: 2,
    };
    replicationRepository.getByName.returns(replication);

    // when
    await extractTransformAndLoadData({
      replicationName,
      replicationRepository,
      datamartKnex,
      datawarehouseKnex,
    });

    // then
    expect(replicationRepository.getByName).to.have.been.calledOnceWithExactly(replicationName);

    expect(fromFunction).to.have.been.calledOnce;
    expect(fromFunction).to.have.been.calledWithExactly({ datawarehouseKnex, datamartKnex });
    expect(fromFunction).to.have.been.calledBefore(toFunction);

    expect(toFunction).to.have.been.calledThrice;
    expect(toFunction).to.have.been.calledWithExactly({ datawarehouseKnex, datamartKnex }, [0, 1]);
    expect(toFunction).to.have.been.calledWithExactly({ datawarehouseKnex, datamartKnex }, [2, 3]);
    expect(toFunction).to.have.been.calledWithExactly({ datawarehouseKnex, datamartKnex }, [4]);

    expect(toQueryBuilder.connection).to.have.been.calledThrice;
    expect(toQueryBuilder.connection).to.always.have.been.calledWithExactly(connection);

    expect(datamartKnex.context.client.releaseConnection).to.have.been.calledOnceWithExactly(connection);
  });

  describe('when chunkSize are not provided', function () {
    it('should use default chunkSize', async function () {
      // given
      const replication = {
        from: fromFunction,
        to: toFunction,
      };
      replicationRepository.getByName.returns(replication);

      // when
      await extractTransformAndLoadData({
        replicationName: 'foo',
        replicationRepository,
        datamartKnex,
        datawarehouseKnex,
      });

      expect(toFunction).to.have.been.calledOnceWithExactly({ datawarehouseKnex, datamartKnex }, [0, 1, 2, 3, 4]);
    });
  });

  describe('when a before function is defined', function () {
    it('should call before function first', async function () {
      // given
      const beforeFunction = sinon.stub().resolves();

      const replication = {
        from: fromFunction,
        before: beforeFunction,
        to: toFunction,
        chunkSize: 2,
      };
      replicationRepository.getByName.returns(replication);

      // when
      await extractTransformAndLoadData({
        replicationName: 'foo',
        replicationRepository,
        datamartKnex,
        datawarehouseKnex,
      });

      // then
      expect(beforeFunction).to.have.been.calledOnceWithExactly({ datawarehouseKnex, datamartKnex });
      expect(beforeFunction).to.have.been.calledBefore(fromFunction);

      expect(fromFunction).to.have.been.calledOnce;
      expect(toFunction).to.have.been.calledThrice;
      expect(toQueryBuilder.connection).to.have.been.calledThrice;
    });

    describe('when before returns an object', function () {
      it('should be assigned in context', async function () {
        // given
        const beforeFunction = sinon.stub().resolves({ foo: 'foo', bar: 'bar' });

        const replication = {
          from: fromFunction,
          to: toFunction,
          before: beforeFunction,
          chunkSize: 2,
        };
        replicationRepository.getByName.returns(replication);

        // when
        await extractTransformAndLoadData({
          replicationName: 'foo',
          replicationRepository,
          datamartKnex,
          datawarehouseKnex,
        });

        // then
        expect(beforeFunction).to.have.been.calledOnceWithExactly({ datawarehouseKnex, datamartKnex });
        expect(beforeFunction).to.have.been.calledBefore(fromFunction);

        expect(fromFunction).to.have.been.calledOnceWithExactly({
          datawarehouseKnex,
          datamartKnex,
          foo: 'foo',
          bar: 'bar',
        });

        expect(toFunction).to.have.been.calledThrice;
        expect(toFunction).to.have.been.calledWithExactly(
          { datawarehouseKnex, datamartKnex, foo: 'foo', bar: 'bar' },
          [0, 1],
        );
        expect(toFunction).to.have.been.calledWithExactly(
          { datawarehouseKnex, datamartKnex, foo: 'foo', bar: 'bar' },
          [2, 3],
        );
        expect(toFunction).to.have.been.calledWithExactly(
          { datawarehouseKnex, datamartKnex, foo: 'foo', bar: 'bar' },
          [4],
        );

        expect(toQueryBuilder.connection).to.have.been.calledThrice;
      });
    });
  });

  describe('when a transform function is defined', function () {
    it('should call it for each row', async function () {
      // given
      const transform = (row) => row + 1;
      const replication = {
        from: fromFunction,
        to: toFunction,
        transform,
        chunkSize: 2,
      };
      replicationRepository.getByName.returns(replication);

      // when
      await extractTransformAndLoadData({
        replicationName: 'foo',
        replicationRepository,
        datamartKnex,
        datawarehouseKnex,
      });

      // then
      expect(toFunction).to.have.been.calledThrice;
      expect(toFunction).to.have.been.calledWithExactly({ datawarehouseKnex, datamartKnex }, [1, 2]);
      expect(toFunction).to.have.been.calledWithExactly({ datawarehouseKnex, datamartKnex }, [3, 4]);
      expect(toFunction).to.have.been.calledWithExactly({ datawarehouseKnex, datamartKnex }, [5]);
    });
  });
});
