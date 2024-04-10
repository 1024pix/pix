import { getReadyIdentityProviders } from '../../../../lib/domain/usecases/get-ready-identity-providers.js';
import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-ready-identity-providers', function () {
  describe('when an audience is provided', function () {
    describe('when the provided audience is equal to "admin"', function () {
      it('returns oidc providers from getReadyOidcProviderServicesForPixAdmin', function () {
        // given
        const oneOidcProviderService = {};
        const anotherOidcProviderService = {};
        const oidcAuthenticationServiceRegistryStub = {
          getReadyOidcProviderServicesForPixAdmin: sinon
            .stub()
            .returns([oneOidcProviderService, anotherOidcProviderService]),
        };

        // when
        const identityProviders = getReadyIdentityProviders({
          audience: PIX_ADMIN.AUDIENCE,
          oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
        });

        // then
        expect(oidcAuthenticationServiceRegistryStub.getReadyOidcProviderServicesForPixAdmin).to.have.been.calledOnce;
        expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
      });
    });
  });

  it('returns oidc providers from getReadyOidcProviderServices', function () {
    // given
    const oneOidcProviderService = {};
    const anotherOidcProviderService = {};
    const oidcAuthenticationServiceRegistryStub = {
      getReadyOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
    };

    // when
    const identityProviders = getReadyIdentityProviders({
      audience: null,
      oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
    });

    // then
    expect(oidcAuthenticationServiceRegistryStub.getReadyOidcProviderServices).to.have.been.calledOnce;
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});
