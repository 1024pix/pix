// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-restricted-paths */
import { expect } from '../../../test-helper.js';
import { databaseBuffer } from '../../../../db/database-builder/database-buffer.js';

describe('Unit | Tooling | DatabaseBuilder | database-buffer', function () {
  afterEach(function () {
    databaseBuffer.objectsToInsert = [];
  });

  describe('#getNextId', function () {
    it('should return next incremental id', function () {
      // when
      const idA = databaseBuffer.getNextId();
      const idB = databaseBuffer.getNextId();
      const idC = databaseBuffer.getNextId();

      // then
      expect(idB).to.equal(idA + 1);
      expect(idC).to.equal(idB + 1);
    });
  });

  describe('#pushInsertable', function () {
    it('should add an object to insert', function () {
      // given
      const tableName = 'someTableName';
      const values = { id: 123, a: 'aVal', b: 'bVal' };

      // when
      databaseBuffer.pushInsertable({ tableName, values });

      // then
      expect(databaseBuffer.objectsToInsert).to.deep.equal([{ tableName, values }]);
    });

    it('should return inserted values', function () {
      // given
      const tableName = 'someTableName';
      const values = { id: 123, a: 'aVal', b: 'bVal' };

      // when
      const expectedValues = databaseBuffer.pushInsertable({ tableName, values });

      // then
      expect(expectedValues).to.deep.equal(values);
    });
  });

  describe('#purge', function () {
    it('should empty objectsToInsert array', function () {
      // given
      databaseBuffer.objectsToInsert = ['someValue'];

      // when
      databaseBuffer.purge();

      // then
      expect(databaseBuffer.objectsToInsert).to.be.empty;
    });
  });
});
