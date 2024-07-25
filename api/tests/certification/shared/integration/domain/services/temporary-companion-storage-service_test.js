import * as temporaryCompanionStorageService from '../../../../../../src/certification/shared/domain/services/temporary-companion-storage-service.js';
import { temporaryStorage } from '../../../../../../src/shared/infrastructure/temporary-storage/index.js';
import { expect } from '../../../../../test-helper.js';
const temporaryCompanionStorage = temporaryStorage.withPrefix('companion:ping:');

describe('Integration | Domain | Services | temporary companion storage service', function () {
  describe('#save', function () {
    it('should save', async function () {
      // given  when
      await temporaryCompanionStorageService.save({ sessionId: 11, certificationCandidateId: 123 });
      const result = await temporaryCompanionStorage.get(`11:123`);

      // then
      expect(result).to.equal(true);
    });
  });

  describe('#getBySessionId', function () {
    it('should get all candidates ids stored for the given session id', async function () {
      // given
      await temporaryCompanionStorageService.save({ sessionId: 11, certificationCandidateId: 123 });
      await temporaryCompanionStorageService.save({ sessionId: 11, certificationCandidateId: 456 });
      await temporaryCompanionStorageService.save({ sessionId: 12, certificationCandidateId: 789 });

      // when
      const values = await temporaryCompanionStorageService.getBySessionId(11);

      // then
      expect(values).to.exactlyContain([123, 456]);
    });
  });
});
