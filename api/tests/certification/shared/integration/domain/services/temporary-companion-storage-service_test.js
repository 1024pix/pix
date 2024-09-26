import * as temporaryCompanionStorageService from '../../../../../../src/certification/shared/domain/services/temporary-companion-storage-service.js';
import { temporaryStorage } from '../../../../../../src/shared/infrastructure/temporary-storage/index.js';
import { expect } from '../../../../../test-helper.js';
const temporaryCompanionStorage = temporaryStorage.withPrefix('companion:ping:');

describe('Integration | Domain | Services | temporary companion storage service', function () {
  describe('#getBySessionId', function () {
    it('should get all candidates ids stored for the given session id', async function () {
      // given
      const value = true;
      const expirationDelaySeconds = 45;
      await temporaryCompanionStorage.save({ key: '11:123', value, expirationDelaySeconds });
      await temporaryCompanionStorage.save({ key: '11:456', value, expirationDelaySeconds });
      await temporaryCompanionStorage.save({ key: '12:789', value, expirationDelaySeconds });

      // when
      const values = await temporaryCompanionStorageService.getBySessionId(11);

      // then
      expect(values).to.exactlyContain([123, 456]);
    });
  });
});
