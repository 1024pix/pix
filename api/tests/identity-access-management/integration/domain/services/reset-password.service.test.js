import { resetPasswordService } from '../../../../../src/identity-access-management/domain/services/reset-password.service.js';
import { expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | Service | reset-password', function () {
  describe('#generateTemporaryKey', function () {
    context('when two users send a request at the same second', function () {
      it('generates different temporaryKeys', async function () {
        // when
        const temporaryKeyUser1 = await resetPasswordService.generateTemporaryKey();
        const temporaryKeyUser2 = await resetPasswordService.generateTemporaryKey();

        // then
        expect(temporaryKeyUser1).to.not.equal(temporaryKeyUser2);
      });
    });
  });
});
