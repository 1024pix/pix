import { temporaryStorage } from '../../../../../../lib/infrastructure/temporary-storage/index.js';
import * as temporaryCompanionStorageService from '../../../../../../src/certification/shared/domain/services/temporary-companion-storage-service.js';
import { expect } from '../../../../../test-helper.js';
const temporaryCompanionStorage = temporaryStorage.withPrefix('companion:ping:');

describe('Integration | Domain | Services | temporary companion storage service', function () {
  describe('#save', function () {
    it('should save', async function () {
      // given  when
      await temporaryCompanionStorageService.save({ sessionId: 11, id: 123 });
      const result = await temporaryCompanionStorage.get(`11:123`);

      // then
      expect(result).to.equal(true);
    });
  });
});
