import sinon from 'sinon';

import * as privacyUsersApiRepository from '../../../../../src/identity-access-management/infrastructure/repositories/privacy-users-api.repository.js';

describe('Unit | Identity Access Management | Infrastructure | Repositories | privacy-users-api', function () {
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

  describe('#anonymizeUser', function () {
    it('anonymizes everything related to the user', async function () {
      // given
      const dependencies = {
        privacyUsersApi: {
          anonymizeUser: sinon.stub().resolves(),
        },
      };

      const userId = Symbol('userId');
      const anonymizedByUserId = userId;
      const anonymizedByUserRole = 'USER';
      const client = 'PIX_APP';

      // when
      await privacyUsersApiRepository.anonymizeUser({
        userId,
        anonymizedByUserId,
        anonymizedByUserRole,
        client,
        dependencies,
      });

      // then
      expect(dependencies.privacyUsersApi.anonymizeUser).to.have.been.calledWithExactly({
        userId,
        anonymizedByUserId,
        anonymizedByUserRole,
        client,
      });
    });
  });
});
