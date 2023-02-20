import { expect } from '../../../../test-helper';
import authenticationSessionService from '../../../../../lib/domain/services/authentication/authentication-session-service';

describe('Unit | Domain | Services | authentication session', function () {
  describe('#getByKey', function () {
    it('should retrieve the sessionContentTokens if it exists', async function () {
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

    it('should return undefined if key not exists', async function () {
      // given
      const key = 'key';

      // when
      const result = await authenticationSessionService.getByKey(key);

      // then
      expect(result).to.be.undefined;
    });
  });

  describe('#save', function () {
    it('should save sessionContentTokens and return a key', async function () {
      // given
      const idToken = 'idToken';

      // when
      const key = await authenticationSessionService.save({ sessionContent: { idToken } });

      // then
      expect(key).to.exist;
    });
  });

  describe('#update', function () {
    it('should set a new value', async function () {
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
