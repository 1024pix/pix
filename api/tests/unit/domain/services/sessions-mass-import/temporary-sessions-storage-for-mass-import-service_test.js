const { expect } = require('../../../../test-helper');
const temporarySessionsStorageForMassImportService = require('../../../../../lib/domain/services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service');
const { temporaryStorage } = require('../../../../../lib/infrastructure/temporary-storage');
const sessionMassImportTemporaryStorage = temporaryStorage.withPrefix('sessions-mass-import:');
describe('Unit | Domain | Services | sessions mass import', function () {
  describe('#save', function () {
    it('should save sessions accessible with returned uuid', async function () {
      // given
      const sessions = [{ id: 1, name: 'session 1' }];
      const userId = '123';

      // when
      const uuid = await temporarySessionsStorageForMassImportService.save({ sessions, userId });
      const result = await sessionMassImportTemporaryStorage.get(`123:${uuid}`);

      // then
      expect(result).to.deep.equal([{ id: 1, name: 'session 1' }]);
    });
  });

  describe('#getByKeyAndUserId', function () {
    context('when key not exists', function () {
      it('should return undefined', async function () {
        // given
        const key = 'key';
        const userId = 123;

        // when
        const result = await temporarySessionsStorageForMassImportService.getByKeyAndUserId({
          cachedValidatedSessionsKey: key,
          userId,
        });

        // then
        expect(result).to.be.undefined;
      });
    });

    context('when key exists', function () {
      it('should get sessions accessible with cached validated sessions key and user id', async function () {
        // given
        const sessions = [{ id: 1, name: 'session 1' }];
        const userId = '123';
        const key = await temporarySessionsStorageForMassImportService.save({ sessions, userId });

        // when
        const result = await temporarySessionsStorageForMassImportService.getByKeyAndUserId({
          cachedValidatedSessionsKey: key,
          userId,
        });

        // then
        expect(result).to.deep.equal([{ id: 1, name: 'session 1' }]);
      });
    });
  });

  describe('#delete', function () {
    it('should delete cached validated sessions', async function () {
      // given
      const sessions = [{ id: 1, name: 'session 1' }];
      const userId = '123';
      const key = await temporarySessionsStorageForMassImportService.save({ sessions, userId });

      // when
      await temporarySessionsStorageForMassImportService.delete({
        cachedValidatedSessionsKey: key,
        userId,
      });

      // then
      const result = await temporarySessionsStorageForMassImportService.getByKeyAndUserId({
        cachedValidatedSessionsKey: key,
        userId,
      });
      expect(result).to.be.undefined;
    });
  });
});
