const { expect, catchErr } = require('../../../../test-helper');
const authenticationRegistry = require('../../../../../lib/domain/services/authentication/authentication-service-registry');
const PoleEmploiOidcAuthenticationService = require('../../../../../lib/domain/services/authentication/pole-emploi-oidc-authentication-service');
const FwbOidcAuthenticationService = require('../../../../../lib/domain/services/authentication/fwb-oidc-authentication-service');
const { InvalidIdentityProviderError } = require('../../../../../lib/domain/errors');

describe('Unit | Domain | Services | authentication registry', function () {
  describe('#lookupAuthenticationService', function () {
    it('should find the identity provider service', async function () {
      // given
      const identityProvider = 'POLE_EMPLOI';

      // when
      const service = await authenticationRegistry.lookupAuthenticationService(identityProvider);

      // then
      expect(service).to.be.an.instanceOf(PoleEmploiOidcAuthenticationService);
    });

    it('finds the identity provider service with hasLogoutUrl', async function () {
      // given
      const identityProvider = 'FWB';

      // when
      const service = await authenticationRegistry.lookupAuthenticationService(identityProvider);

      // then
      expect(service).to.be.an.instanceOf(FwbOidcAuthenticationService);
      expect(service.hasLogoutUrl).to.be.true;
    });

    it('should throw an error when identity provider is not supported', async function () {
      // given
      const identityProvider = 'IDP';

      // when
      const error = await catchErr(authenticationRegistry.lookupAuthenticationService)(identityProvider);

      // then
      expect(error).to.be.an.instanceOf(InvalidIdentityProviderError);
      expect(error.message).to.equal(`Identity provider ${identityProvider} is not supported.`);
    });
  });
});
