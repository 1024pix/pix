import { InvalidIdentityProviderError } from '../../../../../lib/domain/errors.js';
import * as authenticationRegistry from '../../../../../lib/domain/services/authentication/authentication-service-registry.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Domain | Services | authentication registry', function () {
  describe('#getOidcProviderServices', function () {
    it('returns all ready OIDC Providers', async function () {
      // when
      const services = authenticationRegistry.getOidcProviderServices();

      // then
      const serviceCodes = services.map((service) => service.code);
      expect(serviceCodes).to.contain('POLE_EMPLOI');
      expect(serviceCodes).to.contain('CNAV');
    });
  });

  describe('#getOidcProviderServiceByCode', function () {
    it('returns a ready OIDC Provider', function () {
      // given
      const identityProvider = 'POLE_EMPLOI';

      // when
      const service = authenticationRegistry.getOidcProviderServiceByCode(identityProvider);

      // then
      expect(service.code).to.equal('POLE_EMPLOI');
    });

    it('throws an error when identity provider is not supported', function () {
      // given
      const identityProvider = 'UNSUPPORTED_OIDC_PROVIDER';

      // when
      const error = catchErrSync(authenticationRegistry.getOidcProviderServiceByCode)(identityProvider);

      // then
      expect(error).to.be.an.instanceOf(InvalidIdentityProviderError);
      expect(error.message).to.equal(`Identity provider ${identityProvider} is not supported.`);
    });
  });
});
