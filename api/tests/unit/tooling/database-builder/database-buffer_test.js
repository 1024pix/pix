const { expect } = require('../../../test-helper');
const databaseBuffer = require('../../../../db/database-builder/database-buffer');

describe('Unit | Tooling | DatabaseBuilder | database-buffer', () => {
  afterEach(() => {
    databaseBuffer.objectsToInsert = [];
  });

  describe('#getNextId', () => {
    it('should return next incremental id', () => {
      // when
      const idA = databaseBuffer.getNextId();
      const idB = databaseBuffer.getNextId();
      const idC = databaseBuffer.getNextId();

      // then
      expect(idB).to.equal(idA + 1);
      expect(idC).to.equal(idB + 1);
    });
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
  });

  describe('#purge', () => {

    it('should empty objectsToInsert array', () => {
      // given
      databaseBuffer.objectsToInsert = ['someValue'];

      // when
      databaseBuffer.purge();

      // then
      expect(databaseBuffer.objectsToInsert).to.be.empty;
    });
  });
});
