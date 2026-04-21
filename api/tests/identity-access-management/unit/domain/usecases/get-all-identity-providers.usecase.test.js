import sinon from 'sinon';

import { getAllIdentityProviders } from '../../../../../src/identity-access-management/domain/usecases/get-all-identity-providers.usecase.js';

describe('Unit | Identity Access Management | Domain | UseCases | get-all-identity-providers', function () {
  it('returns oidc providers from oidcAuthenticationServiceRegistry', async function () {
    // given
    const oneOidcProviderService = {};
    const anotherOidcProviderService = {};
    const oidcAuthenticationServiceRegistryStub = {
      getAllOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
    };

    // when
    const identityProviders = await getAllIdentityProviders({
      oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
    });

    // then
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});
