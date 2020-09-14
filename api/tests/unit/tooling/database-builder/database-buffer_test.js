const { expect } = require('../../../test-helper');
const databaseBuffer = require('../../../tooling/database-builder/database-buffer');

describe('Unit | Tooling | DatabaseBuilder | database-buffer', () => {
  afterEach(() => {
    databaseBuffer.objectsToInsert = [];
    databaseBuffer.tablesToDelete = [];
  });

  describe('#pushInsertable', () => {

    it('should add an object to insert', () => {
      // given
      const tableName = 'someTableName';
      const values = { id: 123, a: 'aVal', b: 'bVal' };

      // when
      databaseBuffer.pushInsertable({ tableName, values });

      // then
      expect(databaseBuffer.objectsToInsert).to.deep.equal([
        { tableName, values },
      ]);
    });

    it('should return inserted values', () => {
      // given
      const tableName = 'someTableName';
      const values = { id: 123, a: 'aVal', b: 'bVal' };

      // when
      const expectedValues = databaseBuffer.pushInsertable({ tableName, values });

      // then
      expect(expectedValues).to.deep.equal(values);
    });

    context('when no id is provided along with the object', () => {

      it('should add an id property along with original properties in the values', () => {
        // given
        const tableName = 'someTableName';
        const values = { a: 'aVal', b: 'bVal' };
        const expectedId = databaseBuffer.nextId;

        // when
        databaseBuffer.pushInsertable({ tableName, values });

        // then
        expect(databaseBuffer.objectsToInsert).to.deep.equal([
          { tableName, values: { ...values, id: expectedId } },
        ]);
      });

      it('should increment internal id counter', () => {
        // given
        const tableName = 'someTableName';
        const values = { a: 'aVal', b: 'bVal' };

        // when
        const { id: initialId } = databaseBuffer.pushInsertable({ tableName, values });
        const { id: incrementedId } = databaseBuffer.pushInsertable({ tableName, values });

        // then
        expect(incrementedId).to.equal(initialId + 1);
      });

      it('should return inserted values with the id in it', () => {
        // given
        const tableName = 'someTableName';
        const values = { a: 'aVal', b: 'bVal' };

        // when
        const { id: initialId } = databaseBuffer.pushInsertable({ tableName, values });
        const expectedValues = databaseBuffer.pushInsertable({ tableName, values });

        // then
        expect(expectedValues).to.deep.equal({ ...expectedValues, id: initialId + 1 });
      });
    });
  });

  describe('#purge', () => {

    it('should empty both objectsToInsert and tablesToDelete arrays', () => {
      // given
      databaseBuffer.objectsToInsert = ['someValue'];
      databaseBuffer.tablesToDelete = ['someOtherValue'];

      // when
      databaseBuffer.purge();

      // then
      expect(databaseBuffer.objectsToInsert).to.be.empty;
      expect(databaseBuffer.tablesToDelete).to.be.empty;
    });

    context('when no id is provided along with the object', () => {

      it('should add an id property along with original properties in the values', () => {
        // given
        const tableName = 'someTableName';
        const values = { a: 'aVal', b: 'bVal' };
        const expectedId = databaseBuffer.nextId;

        // when
        databaseBuffer.pushInsertable({ tableName, values });

        // then
        expect(databaseBuffer.objectsToInsert).to.deep.equal([
          { tableName, values: { ...values, id: expectedId } },
        ]);
      });

      it('should increment internal id counter', () => {
        // given
        const tableName = 'someTableName';
        const values = { a: 'aVal', b: 'bVal' };
        const expectedNextIdIncremented = databaseBuffer.nextId + 1;

        // when
        databaseBuffer.pushInsertable({ tableName, values });

        // then
        expect(databaseBuffer.nextId).to.equal(expectedNextIdIncremented);
      });
    });
  });
});
