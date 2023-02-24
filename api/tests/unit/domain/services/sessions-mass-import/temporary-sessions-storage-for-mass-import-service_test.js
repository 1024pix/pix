const { expect } = require('../../../../test-helper');
const temporarySessionsStorageForMassImport = require('../../../../../lib/domain/services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service');
const temporaryStorage = require('../../../../../lib/infrastructure/temporary-storage').withPrefix(
  'sessions-mass-import:'
);

describe('Unit | Domain | Services | sessions mass import', function () {
  describe('#save', function () {
    it('should save sessions accessible with returned uuid', async function () {
      // given
      const sessions = [{ id: 1, name: 'session 1' }];
      const userId = '123';

      // when
      const uuid = await temporarySessionsStorageForMassImport.save({ sessions, userId });
      const result = await temporaryStorage.get(`123:${uuid}`);

      // then
      expect(result).to.deep.equal([{ id: 1, name: 'session 1' }]);
    });
  });
});
