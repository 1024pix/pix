const { expect } = require('../../../../test-helper');
const authenticationSessionService = require('../../../../../lib/domain/services/authentication/authentication-session-service');

describe('Unit | Domain | Services | authentication session', function () {
  describe('#getByKey', function () {
    it('should retrieve id token if it exists', async function () {
      // given
      const idToken = 'idToken';
      const key = await authenticationSessionService.save(idToken);

      // when
      const result = await authenticationSessionService.getByKey(key);

      // then
      expect(result).to.equal(idToken);
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
    it('should save id token and return a key', async function () {
      // given
      const cnavIdToken = 'idToken';

      // when
      const key = await authenticationSessionService.save(cnavIdToken);

      // then
      expect(key).to.exist;
    });
  });
});
