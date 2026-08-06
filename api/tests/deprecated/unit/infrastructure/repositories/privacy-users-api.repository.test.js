import sinon from 'sinon';

import * as privacyUsersApiRepository from '../../../../../src/deprecated/infrastructure/repositories/privacy-users-api.repository.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Deprecated | Infrastructure | Repositories | privacy-users-api', function () {
  describe('#canSelfDeleteAccount', function () {
    it('indicates if user can self delete their account', async function () {
      // given
      const dependencies = {
        privacyUsersApi: {
          canSelfDeleteAccount: sinon.stub().returns(true),
        },
      };

      const userId = Symbol('userId');

      // when
      const result = await privacyUsersApiRepository.canSelfDeleteAccount({ userId, dependencies });

      // then
      expect(dependencies.privacyUsersApi.canSelfDeleteAccount).to.have.been.calledWithExactly({
        userId,
      });

      expect(result).to.be.true;
    });
  });
});
