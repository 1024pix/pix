import { getReadyIdentityProviders } from '../../../../lib/domain/usecases/get-ready-identity-providers.js';
import { expect, sinon } from '../../../test-helper.js';
import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';

describe('Unit | UseCase | get-ready-identity-providers', function () {
  describe('when an audience is provided', function () {
    describe('when the provided audience is equal to "admin"', function () {
      it('returns oidc providers from getReadyOidcProviderServicesForPixAdmin', function () {
        // given
        const oneOidcProviderService = {};
        const anotherOidcProviderService = {};
        const authenticationServiceRegistryStub = {
          getReadyOidcProviderServicesForPixAdmin: sinon
            .stub()
            .returns([oneOidcProviderService, anotherOidcProviderService]),
        };

        // when
        const identityProviders = getReadyIdentityProviders({
          audience: PIX_ADMIN.AUDIENCE,
          authenticationServiceRegistry: authenticationServiceRegistryStub,
        });

        // then
        expect(authenticationServiceRegistryStub.getReadyOidcProviderServicesForPixAdmin).to.have.been.calledOnce;
        expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
      });
    });
  });

  it('returns oidc providers from getReadyOidcProviderServices', function () {
    // given
    const oneOidcProviderService = {};
    const anotherOidcProviderService = {};
    const authenticationServiceRegistryStub = {
      getReadyOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
    };

    // when
    const identityProviders = getReadyIdentityProviders({
      audience: null,
      authenticationServiceRegistry: authenticationServiceRegistryStub,
    });

    // then
    expect(authenticationServiceRegistryStub.getReadyOidcProviderServices).to.have.been.calledOnce;
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});
