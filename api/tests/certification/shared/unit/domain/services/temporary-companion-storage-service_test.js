import * as temporaryCompanionStorageService from '../../../../../../src/certification/shared/domain/services/temporary-companion-storage-service.js';
import { config } from '../../../../../../src/shared/config.js';
import { temporaryStorage } from '../../../../../../src/shared/infrastructure/temporary-storage/index.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Services | temporary companion storage service', function () {
  describe('#save', function () {
    it('should save with a TTL', async function () {
      // given
      sinon.stub(config.temporaryCompanionStorage, 'expirationDelaySeconds').value(99);
      const save = sinon.stub();
      sinon.stub(temporaryStorage, 'withPrefix');
      temporaryStorage.withPrefix.returns({ save });

      // when
      await temporaryCompanionStorageService.save({ sessionId: 11, certificationCandidateId: 123 });

      // then
      expect(save).to.have.been.calledWith({
        key: `11:123`,
        value: true,
        expirationDelaySeconds: 99,
      });
    });
  });
});
