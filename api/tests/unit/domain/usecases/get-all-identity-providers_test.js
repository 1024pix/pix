import { getAllIdentityProviders } from '../../../../lib/domain/usecases/get-all-identity-providers.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-all-identity-providers', function () {
  it('returns oidc providers from oidcAuthenticationServiceRegistry', function () {
    // given
    const oneOidcProviderService = {};
    const anotherOidcProviderService = {};
    const oidcAuthenticationServiceRegistryStub = {
      getAllOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
    };

    // when
    const identityProviders = getAllIdentityProviders({
      oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
    });

    // then
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});
