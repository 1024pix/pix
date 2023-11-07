import { expect, catchErrSync } from '../../../../test-helper.js';
import * as authenticationRegistry from '../../../../../lib/domain/services/authentication/authentication-service-registry.js';
import { InvalidIdentityProviderError } from '../../../../../lib/domain/errors.js';

describe('Unit | Domain | Services | authentication registry', function () {
  describe('#getAllOidcProviderServices', function () {
    it('returns all OIDC Providers', async function () {
      // when
      const services = authenticationRegistry.getAllOidcProviderServices();

      // then
      const serviceCodes = services.map((service) => service.code);
      expect(serviceCodes).to.contain('POLE_EMPLOI');
      expect(serviceCodes).to.contain('CNAV');
      expect(serviceCodes).to.contain('FWB');
      expect(serviceCodes).to.contain('GOOGLE');
    });
  });

  describe('#getReadyOidcProviderServices', function () {
    it('returns ready OIDC Providers', function () {
      // when
      const services = authenticationRegistry.getReadyOidcProviderServices();

      // then
      const serviceCodes = services.map((service) => service.code);
      expect(serviceCodes).to.contain('POLE_EMPLOI');
      expect(serviceCodes).to.contain('CNAV');
      expect(serviceCodes).not.to.contain('FWB');
      expect(serviceCodes).not.to.contain('GOOGLE');
    });
  });

  describe('#getOidcProviderServiceByCode', function () {
    describe('when the source is pix-admin', function () {
      it('returns a disabled OIDC Provider', function () {
        // given
        const source = 'pix-admin';
        const disabledIdentityProvider = 'GOOGLE';

        // when
        const service = authenticationRegistry.getOidcProviderServiceByCode(disabledIdentityProvider, source);

        // then
        expect(service.code).to.equal('GOOGLE');
      });
    });

    describe('when the source is undefined (pix-app by default)', function () {
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
});
