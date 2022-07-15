const { expect, sinon } = require('../../../../test-helper');
const settings = require('../../../../../lib/config');

const OidcAuthenticationService = require('../../../../../lib/domain/services/authentication/oidc-authentication-service');
const jsonwebtoken = require('jsonwebtoken');

describe('Unit | Domain | Services | oidc-authentication-service', function () {
  describe('#createAccessToken', function () {
    it('should create access token with user id, source and identityProvider', function () {
      // given
      const userId = 42;
      const accessToken = Symbol('valid access token');
      const source = Symbol('an oidc source');
      const identityProvider = Symbol('name of identityProvider');
      settings.authentication.secret = 'a secret';
      const payload = {
        user_id: userId,
        source,
        identity_provider: identityProvider,
      };
      const secret = 'a secret';
      const jwtOptions = { expiresIn: 1 };
      sinon.stub(jsonwebtoken, 'sign').withArgs(payload, secret, jwtOptions).returns(accessToken);

      const oidcAuthenticationService = new OidcAuthenticationService({ source, identityProvider, jwtOptions });

      // when
      const result = oidcAuthenticationService.createAccessToken(userId);

      // then
      expect(result).to.equal(accessToken);
    });
  });
});
