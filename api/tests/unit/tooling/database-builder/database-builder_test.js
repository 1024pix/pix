const { expect, sinon, catchErr } = require('../../../test-helper');
const DatabaseBuilder = require('../../../../db/database-builder/database-builder');

describe('Unit | Tooling | DatabaseBuilder | database-builder', function() {

  describe('#clean', function() {
    let databaseBuilder;
    let knex;
    const sandbox = sinon.createSandbox();

    beforeEach(function() {
      knex = { raw: sinon.stub().resolves() };
      databaseBuilder = new DatabaseBuilder({ knex });
      sandbox.spy(databaseBuilder.databaseBuffer);
    });

    afterEach(function() {
      sandbox.restore();
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [];
    });

    it('should delete content of all tables in databaseBuffer set for deletion when there are some', async function() {
      // given
      const knex = { raw: sinon.stub().resolves() };
      const databaseBuilder = new DatabaseBuilder({ knex });
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [{
        table: 'table2',
        isDirty: true,
      }, {
        table: 'table1',
        isDirty: true,
      }, {
        table: 'table3',
        isDirty: false,
      }];

      // when
      await databaseBuilder.clean();

      // then
      expect(knex.raw).to.have.been.calledWithExactly('DELETE FROM ??;DELETE FROM ??;', ['table2', 'table1']);
    });

    it('should avoid deleting anything if not table are set for deletion in database buffer', async function() {
      // given
      const knex = { raw: sinon.stub().resolves() };
      const databaseBuilder = new DatabaseBuilder({ knex });

      // when
      await databaseBuilder.clean();

      // then
      expect(knex.raw).to.not.have.been.called;
    });

    it('should reset the dirtyness map', async function() {
      // given
      const knex = { raw: sinon.stub().resolves() };
      const databaseBuilder = new DatabaseBuilder({ knex });
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [{
        table: 'table1',
        isDirty: true,
      }, {
        table: 'table2',
        isDirty: true,
      }, {
        table: 'table3',
        isDirty: false,
      }];

      // when
      await databaseBuilder.clean();

      // then
      expect(databaseBuilder.tablesOrderedByDependencyWithDirtinessMap).to.deep.equal([{
        table: 'table1',
        isDirty: false,
      }, {
        table: 'table2',
        isDirty: false,
      }, {
        table: 'table3',
        isDirty: false,
      }]);
    });

    it('should purge the databasebuffer', async function() {
      // given
      const knex = { raw: sinon.stub().resolves() };
      const databaseBuilder = new DatabaseBuilder({ knex });

      // when
      await databaseBuilder.clean();

      // then
      expect(databaseBuilder.databaseBuffer.purge).to.have.been.called;
    });
  });

  describe('#commit', function() {
    let databaseBuilder;

    beforeEach(function() {
      databaseBuilder = new DatabaseBuilder({ knex: null });
      sinon.stub(console, 'error');
    });

    afterEach(function() {
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [];
    });

    it('should init the database by cleaning it except for specific tables when this is the first call ever to commit()', async function() {
      // given
      const insertStub = sinon.stub().resolves();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        raw: sinon.stub(),
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      knex.raw.onCall(0).resolves({
        rows: [
          { table_name: 'table1' },
          { table_name: 'table2' },
          { table_name: 'knex_migrations' },
          { table_name: 'knex_migrations_lock' },
          { table_name: 'pix_roles' },
        ],
      });
      knex.raw.onCall(1).resolves();
      knex.raw.onCall(2).resolves({
        rows: [
          { table_name: 'table2' },
          { table_name: 'table1' },
        ],
      });
      databaseBuilder.knex = knex;
      databaseBuilder.isFirstCommit = true;

      // when
      await databaseBuilder.commit();

      // then
      const dirtinessMap = databaseBuilder.tablesOrderedByDependencyWithDirtinessMap;
      expect(knex.raw).to.have.been.calledWithExactly('TRUNCATE "table1","table2"');
      expect(dirtinessMap).to.deep.equal([{
        table: 'table2',
        isDirty: false,
      }, {
        table: 'table1',
        isDirty: false,
      }]);
    });

    it('should insert values in database buffer into the database', async function() {
      // given
      const insertStub = sinon.stub().resolves();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      databaseBuilder.knex = knex;
      databaseBuilder.isFirstCommit = false;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [{
        table: 'table2',
        isDirty: false,
      }, {
        table: 'table1',
        isDirty: false,
      }];
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

    it('should empty objectsToInsert collection in databaseBuffer', async function() {
      // given
      const insertStub = sinon.stub().resolves();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      databaseBuilder.knex = knex;
      databaseBuilder.isFirstCommit = false;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [{
        table: 'table2',
        isDirty: false,
      }, {
        table: 'table1',
        isDirty: false,
      }];
      databaseBuilder.databaseBuffer.objectsToInsert = [
        { tableName: 'table1', values: 'someValuesForTable1' },
        { tableName: 'table2', values: 'someValuesForTable2' },
      ];

      // when
      await databaseBuilder.commit();

      // then
      expect(databaseBuilder.databaseBuffer.objectsToInsert).to.be.empty;
    });

    it('should update the dirtynessmap accordingly', async function() {
      // given
      const insertStub = sinon.stub().resolves();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      databaseBuilder.knex = knex;
      databaseBuilder.isFirstCommit = false;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [{
        table: 'table2',
        isDirty: false,
      }, {
        table: 'table1',
        isDirty: false,
      }, {
        table: 'table3',
        isDirty: false,
      }];
      databaseBuilder.databaseBuffer.objectsToInsert = [
        { tableName: 'table1', values: 'someValuesForTable1' },
        { tableName: 'table2', values: 'someValuesForTable2' },
      ];

      // when
      await databaseBuilder.commit();

      // then
      expect(databaseBuilder.tablesOrderedByDependencyWithDirtinessMap).to.deep.equal([{
        table: 'table2',
        isDirty: true,
      }, {
        table: 'table1',
        isDirty: true,
      }, {
        table: 'table3',
        isDirty: false,
      }]);
    });

    it('should commit the transaction', async function() {
      // given
      const insertStub = sinon.stub().resolves();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      databaseBuilder.knex = knex;
      databaseBuilder.isFirstCommit = false;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [{
        table: 'table2',
        isDirty: false,
      }, {
        table: 'table1',
        isDirty: false,
      }];
      databaseBuilder.databaseBuffer.objectsToInsert = [
        { tableName: 'table1', values: 'someValuesForTable1' },
        { tableName: 'table2', values: 'someValuesForTable2' },
      ];

      // when
      await databaseBuilder.commit();

      // then
      expect(trxStub.commit).to.have.been.calledOnce;
    });

    it('should throw an error when the commit fails', async function() {
      // given
      const insertError = new Error('expected error');
      const trxFake = () => ({ insert: () => { throw insertError; } });
      databaseBuilder.knex = {
        client: { database: () => undefined },
        transaction: sinon.stub().resolves(trxFake),
      };
      databaseBuilder.isFirstCommit = false;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [{
        table: 'table1',
        isDirty: false,
      }];
      databaseBuilder.databaseBuffer.objectsToInsert = [
        { tableName: 'table1', values: 'someValuesForTable1' },
      ];

      // when
      const error = await catchErr(databaseBuilder.commit, databaseBuilder)();

      // then
      expect(error).to.deep.equal(insertError);
    });

    it('should clear the dirtiness map and empty objectsToInsert if something goes wrong when inserting', async function() {
      // given
      const insertStub = sinon.stub().rejects();
      const trxStub = sinon.stub().returns({ insert: insertStub });
      trxStub.commit = sinon.stub().resolves();
      const knex = {
        client: { database: sinon.stub().returns() },
        transaction: sinon.stub().resolves(trxStub),
      };
      databaseBuilder.knex = knex;
      databaseBuilder.isFirstCommit = false;
      databaseBuilder.tablesOrderedByDependencyWithDirtinessMap = [{
        table: 'table2',
        isDirty: false,
      }, {
        table: 'table1',
        isDirty: false,
      }];
      databaseBuilder.databaseBuffer.objectsToInsert = [
        { tableName: 'table1', values: 'someValuesForTable1' },
        { tableName: 'table2', values: 'someValuesForTable2' },
      ];

      // when
      await catchErr(databaseBuilder.commit, databaseBuilder)();

      // then
      expect(databaseBuilder.tablesOrderedByDependencyWithDirtinessMap).to.deep.equal([{
        table: 'table2',
        isDirty: false,
      }, {
        table: 'table1',
        isDirty: false,
      }]);
      expect(databaseBuilder.databaseBuffer.objectsToInsert).to.be.empty;
    });
  });
});
