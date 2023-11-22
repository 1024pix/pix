// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-restricted-paths */
import { expect, sinon, catchErr, knex } from '../../../test-helper.js';
import { DatabaseBuilder } from '../../../../db/database-builder/database-builder.js';

describe('Unit | Tooling | DatabaseBuilder | database-builder', function () {
  describe('#clean', function () {
    let databaseBuilder;
    let knex;
    let sandbox;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      knex = { raw: sinon.stub().resolves(), on: sinon.stub() };
      databaseBuilder = new DatabaseBuilder({ knex });
      sandbox.spy(databaseBuilder.databaseBuffer);
    });

    afterEach(function () {
      sandbox.restore();
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [];
    });

    it('should delete content of all tables in databaseBuffer set for deletion when there are some', async function () {
      // given
      const databaseBuilder = new DatabaseBuilder({ knex });
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [
        {
          table: 'table2',
          isDirty: true,
        },
        {
          table: 'table1',
          isDirty: true,
        },
        {
          table: 'table3',
          isDirty: false,
        },
      ];

      // when
      await databaseBuilder.clean();

      // then
      expect(knex.raw).to.have.been.calledWithExactly('DELETE FROM ??;DELETE FROM ??;', ['table2', 'table1']);
    });

    it('should avoid deleting anything if not table are set for deletion in database buffer', async function () {
      // given
      const databaseBuilder = new DatabaseBuilder({ knex });

      // when
      await databaseBuilder.clean();

      // then
      expect(knex.raw).to.not.have.been.called;
    });

    it('should reset the dirtyness map', async function () {
      // given
      const databaseBuilder = new DatabaseBuilder({ knex });
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [
        {
          table: 'table1',
          isDirty: true,
        },
        {
          table: 'table2',
          isDirty: true,
        },
        {
          table: 'table3',
          isDirty: false,
        },
      ];

      // when
      await databaseBuilder.clean();

      // then
      expect(databaseBuilder.tablesOrderedByDependencyWithDirtinessMap).to.deep.equal([
        {
          table: 'table1',
          isDirty: false,
        },
        {
          table: 'table2',
          isDirty: false,
        },
        {
          table: 'table3',
          isDirty: false,
        },
      ]);
    });

    it('should purge the databasebuffer', async function () {
      // given
      const databaseBuilder = new DatabaseBuilder({ knex });

      // when
      await databaseBuilder.clean();

      // then
      expect(databaseBuilder.databaseBuffer.purge).to.have.been.called;
    });
  });

  describe('#commit', function () {
    let databaseBuilder;

    beforeEach(function () {
      databaseBuilder = new DatabaseBuilder({ knex: null });
      databaseBuilder.isFirstCommit = false;
      sinon.stub(console, 'error');
    });

    afterEach(function () {
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [];
    });

    context('when it is the first time the method is called', function () {
      beforeEach(function () {
        databaseBuilder.isFirstCommit = true;
      });

      it('should init the database by cleaning tables according to dirtyness map order except for specific tables', async function () {
        // given
        const insertStub = sinon.stub().resolves();
        const trxStub = sinon.stub().returns({ insert: insertStub });
        trxStub.commit = sinon.stub().resolves();
        const knex = {
          raw: sinon.stub(),
          client: { database: sinon.stub().returns() },
          transaction: sinon.stub().resolves(trxStub),
          on: sinon.stub(),
        };
        knex.raw.onCall(0).resolves({
          rows: [{ table_name: 'table2' }, { table_name: 'knex_migrations' }, { table_name: 'table1' }],
        });
        knex.raw.onCall(1).resolves();
        databaseBuilder.knex = knex;
        databaseBuilder.isFirstCommit = true;

        // when
        await databaseBuilder.commit();

        // then
        const dirtinessMap = databaseBuilder.tablesOrderedByDependencyWithDirtinessMap;
        expect(knex.raw).to.have.been.calledWithExactly('TRUNCATE "table2","table1"');
        expect(dirtinessMap).to.deep.equal([
          {
            table: 'table2',
            isDirty: false,
          },
          {
            table: 'knex_migrations',
            isDirty: false,
          },
          {
            table: 'table1',
            isDirty: false,
          },
        ]);
      });
    });

    it('should insert values in database buffer into the database', async function () {
      // given
      const insertStub = sinon.stub().resolves();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      databaseBuilder.knex = knex;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [
        {
          table: 'table2',
          isDirty: false,
        },
        {
          table: 'table1',
          isDirty: false,
        },
      ];
      databaseBuilder.databaseBuffer.objectsToInsert = [
        { tableName: 'table1', values: 'someValuesForTable1' },
        { tableName: 'table2', values: 'someValuesForTable2' },
      ];

      // when
      await databaseBuilder.commit();

      // then
      expect(trxStub.firstCall.args).to.deep.equal(['table1']);
      expect(insertStub.firstCall.args).to.deep.equal(['someValuesForTable1']);
      expect(trxStub.secondCall.args).to.deep.equal(['table2']);
      expect(insertStub.secondCall.args).to.deep.equal(['someValuesForTable2']);
    });

    it('should empty objectsToInsert collection in databaseBuffer', async function () {
      // given
      const insertStub = sinon.stub().resolves();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      databaseBuilder.knex = knex;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [
        {
          table: 'table2',
          isDirty: false,
        },
        {
          table: 'table1',
          isDirty: false,
        },
      ];
      databaseBuilder.databaseBuffer.objectsToInsert = [
        { tableName: 'table1', values: 'someValuesForTable1' },
        { tableName: 'table2', values: 'someValuesForTable2' },
      ];

      // when
      await databaseBuilder.commit();

      // then
      expect(databaseBuilder.databaseBuffer.objectsToInsert).to.be.empty;
    });

    it('should update the dirtynessmap accordingly', async function () {
      // given
      const insertStub = sinon.stub().resolves();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      databaseBuilder.knex = knex;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [
        {
          table: 'table2',
          isDirty: false,
        },
        {
          table: 'table1',
          isDirty: false,
        },
        {
          table: 'table3',
          isDirty: false,
        },
      ];
      databaseBuilder.databaseBuffer.objectsToInsert = [
        { tableName: 'table1', values: 'someValuesForTable1' },
        { tableName: 'table2', values: 'someValuesForTable2' },
      ];

      // when
      await databaseBuilder.commit();

      // then
      expect(databaseBuilder.tablesOrderedByDependencyWithDirtinessMap).to.deep.equal([
        {
          table: 'table2',
          isDirty: true,
        },
        {
          table: 'table1',
          isDirty: true,
        },
        {
          table: 'table3',
          isDirty: false,
        },
      ]);
    });

    it('should commit the transaction', async function () {
      // given
      const insertStub = sinon.stub().resolves();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      databaseBuilder.knex = knex;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [
        {
          table: 'table2',
          isDirty: false,
        },
        {
          table: 'table1',
          isDirty: false,
        },
      ];
      databaseBuilder.databaseBuffer.objectsToInsert = [
        { tableName: 'table1', values: 'someValuesForTable1' },
        { tableName: 'table2', values: 'someValuesForTable2' },
      ];

      // when
      await databaseBuilder.commit();

      // then
      expect(trxStub.commit).to.have.been.calledOnce;
    });

    it('should throw an error when the commit fails', async function () {
      // given
      const insertError = new Error('expected error');
      const trxFake = () => ({
        insert: () => {
          throw insertError;
        },
      });
      databaseBuilder.knex = {
        client: { database: () => undefined },
        transaction: sinon.stub().resolves(trxFake),
      };
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [
        {
          table: 'table1',
          isDirty: false,
        },
      ];
      databaseBuilder.databaseBuffer.objectsToInsert = [{ tableName: 'table1', values: 'someValuesForTable1' }];

      // when
      const error = await catchErr(databaseBuilder.commit, databaseBuilder)();

      // then
      expect(error).to.deep.equal(insertError);
    });

    it('should clear the dirtiness map and empty objectsToInsert if something goes wrong when inserting', async function () {
      // given
      const insertStub = sinon.stub().rejects();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      databaseBuilder.knex = knex;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [
        {
          table: 'table2',
          isDirty: false,
        },
        {
          table: 'table1',
          isDirty: false,
        },
      ];
      databaseBuilder.databaseBuffer.objectsToInsert = [
        { tableName: 'table1', values: 'someValuesForTable1' },
        { tableName: 'table2', values: 'someValuesForTable2' },
      ];

      // when
      await catchErr(databaseBuilder.commit, databaseBuilder)();

      // then
      expect(databaseBuilder.tablesOrderedByDependencyWithDirtinessMap).to.deep.equal([
        {
          table: 'table2',
          isDirty: false,
        },
        {
          table: 'table1',
          isDirty: false,
        },
      ]);
      expect(databaseBuilder.databaseBuffer.objectsToInsert).to.be.empty;
    });
  });

  describe('#fixSequences', function () {
    let databaseBuilder;

    beforeEach(function () {
      databaseBuilder = new DatabaseBuilder({ knex: null });
      sinon.stub(console, 'error');
    });

    describe('when there are dirty tables', function () {
      it('should update sequences to the highest id of each dirty table', async function () {
        // given
        const knexFn = {
          from: sinon.stub(),
          client: { database: sinon.stub() },
        };

        knexFn.client.database.returns('pix');

        const columnsResponse = [{ table_name: 'users', column_default: "nextval('users_id_seq'::regclass)" }];
        const whereIn = sinon.stub();
        whereIn.withArgs('table_name', ['users']).resolves(columnsResponse);
        const where = sinon.stub();
        where.withArgs({ table_catalog: 'pix', column_name: 'id' }).returns({ whereIn });
        const whereRaw = sinon.stub().returns({ where });
        const select = sinon.stub().returns({ whereRaw });
        knexFn.from.withArgs('information_schema.columns').returns({ select });

        const maxResponse = { max: 5 };
        const first = sinon.stub().resolves(maxResponse);
        const max = sinon.stub().returns({ first });
        knexFn.from.withArgs('users').callsFake(() => {
          return {
            max,
          };
        });
        knexFn.raw = sinon.spy();
        databaseBuilder.knex = knexFn;
        databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [
          { table: 'assessments', isDirty: false },
          { table: 'users', isDirty: true },
        ];

        // when
        await databaseBuilder.fixSequences();
        expect(knexFn.raw).to.have.been.calledOnceWithExactly('ALTER SEQUENCE "users_id_seq" RESTART WITH 6;');
      });
    });

    describe('when there are no dirty table', function () {
      it('should not update any sequences', async function () {
        // given
        const knexFn = sinon.stub();
        knexFn.raw = sinon.spy();
        databaseBuilder.knex = knexFn;
        databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [
          { table: 'assessments', isDirty: false },
          { table: 'users', isDirty: false },
        ];

        // when
        await databaseBuilder.fixSequences();
        expect(knexFn.raw).not.to.have.been.called;
      });
    });
  });

  describe('#create', function () {
    it('returns an instance of DatabaseBuilder', async function () {
      // given
      // when
      const databaseBuilder = await DatabaseBuilder.create({ knex });

      // then
      expect(databaseBuilder).to.be.an.instanceOf(DatabaseBuilder);
      expect(databaseBuilder.isFirstCommit).to.be.true;
    });
  });
});
