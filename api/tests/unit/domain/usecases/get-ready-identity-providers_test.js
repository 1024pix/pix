import { getReadyIdentityProviders } from '../../../../lib/domain/usecases/get-ready-identity-providers.js';
import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-ready-identity-providers', function () {
  let oneOidcProviderService;
  let anotherOidcProviderService;
  let oidcAuthenticationServiceRegistryStub;

  beforeEach(function () {
    oneOidcProviderService = {};
    anotherOidcProviderService = {};
    oidcAuthenticationServiceRegistryStub = {
      loadOidcProviderServices: sinon.stub(),
      getReadyOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
      getReadyOidcProviderServicesForPixAdmin: sinon
        .stub()
        .returns([oneOidcProviderService, anotherOidcProviderService]),
    };
  });

  describe('when an audience is provided', function () {
    describe('when the provided audience is equal to "admin"', function () {
      it('returns oidc providers from getReadyOidcProviderServicesForPixAdmin', function () {
        // when
        const identityProviders = getReadyIdentityProviders({
          audience: PIX_ADMIN.AUDIENCE,
          oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
        });

        // then
        expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
        expect(oidcAuthenticationServiceRegistryStub.getReadyOidcProviderServicesForPixAdmin).to.have.been.calledOnce;
        expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
      });
    });
  });

  it('returns oidc providers from getReadyOidcProviderServices', function () {
    // when
    const identityProviders = getReadyIdentityProviders({
      audience: null,
      oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
    });

    // then
    expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
    expect(oidcAuthenticationServiceRegistryStub.getReadyOidcProviderServices).to.have.been.calledOnce;
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});
