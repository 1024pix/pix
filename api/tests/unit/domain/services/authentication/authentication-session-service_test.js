const { expect } = require('../../../../test-helper');
const authenticationSessionService = require('../../../../../lib/domain/services/authentication/authentication-session-service');

describe('Unit | Domain | Services | authentication session', function () {
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
