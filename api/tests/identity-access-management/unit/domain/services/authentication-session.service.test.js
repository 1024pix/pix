import { authenticationSessionService } from '../../../../../src/identity-access-management/domain/services/authentication-session.service.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Service | authentication-session', function () {
  describe('#getByKey', function () {
    context('when there a value to retrieve for the given key', function () {
      it('retrieves the sessionContentTokens', async function () {
        // given
        const idToken = 'idToken';
        const key = await authenticationSessionService.save({
          sessionContent: { idToken },
          userInfo: { firstName: 'Eva', lastName: 'Porée' },
        });

        // when
        const result = await authenticationSessionService.getByKey(key);

        // then
        expect(result).to.deep.equal({
          sessionContent: { idToken },
          userInfo: { firstName: 'Eva', lastName: 'Porée' },
        });
      });
    });

    context('when there is no value to retrieve for the given key', function () {
      it('returns undefined', async function () {
        // given
        const key = 'key';

        // when
        const result = await authenticationSessionService.getByKey(key);

        // then
        expect(result).to.be.undefined;
      });
    });
  });

  describe('#save', function () {
    it('saves sessionContentTokens and returns a key', async function () {
      // given
      const idToken = 'idToken';

      // when
      const key = await authenticationSessionService.save({ sessionContent: { idToken } });

      // then
      expect(key).to.exist;
    });
  });

  describe('#update', function () {
    it('sets a new value', async function () {
      // given
      const key = await authenticationSessionService.save({
        sessionContent: { idToken: 'idToken' },
        userInfo: { firstName: 'Eva', lastName: 'Porée' },
      });

      // when
      await authenticationSessionService.update(key, {
        sessionContent: { idToken: 'idToken' },
        userInfo: { firstName: 'Celine', lastName: 'Évitable', userId: 123 },
      });

      // then
      const result = await authenticationSessionService.getByKey(key);
      expect(result).to.deep.equal({
        sessionContent: { idToken: 'idToken' },
        userInfo: { firstName: 'Celine', lastName: 'Évitable', userId: 123 },
      });
    });
  });
});
