const { expect } = require('../../../../test-helper');
const authenticationSessionService = require('../../../../../lib/domain/services/authentication/authentication-session-service');

describe('Unit | Domain | Services | authentication session', function () {
  describe('#save', function () {
    it('should save sessionContentTokens and return a key', async function () {
      // given
      const poleEmploiAuthenticationSessionContent = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };

      // when
      const key = await authenticationSessionService.save(poleEmploiAuthenticationSessionContent);

      // then
      expect(key).to.exist;
    });
  });

  describe('#getByKey', function () {
    it('should retrieve the sessionContentTokens if it exists', async function () {
      // given
      const poleEmploiAuthenticationSessionContent = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      const key = await authenticationSessionService.save(poleEmploiAuthenticationSessionContent);

      // when
      const result = await authenticationSessionService.getByKey(key);

      // then
      expect(result).to.deep.equal(poleEmploiAuthenticationSessionContent);
    });
  });
});
