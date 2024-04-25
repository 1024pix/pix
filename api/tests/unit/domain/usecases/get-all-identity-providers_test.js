import { getAllIdentityProviders } from '../../../../lib/domain/usecases/get-all-identity-providers.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-all-identity-providers', function () {
  it('returns oidc providers from oidcAuthenticationServiceRegistry', async function () {
    // given
    const oneOidcProviderService = {};
    const anotherOidcProviderService = {};
    const oidcAuthenticationServiceRegistryStub = {
      loadOidcProviderServices: sinon.stub().resolves(),
      getAllOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
    };

    // when
    const identityProviders = await getAllIdentityProviders({
      oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
    });

    // then
    expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});
